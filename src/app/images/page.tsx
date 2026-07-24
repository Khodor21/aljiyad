"use client";

import { useRef, useState } from "react";
import { Emoji } from "emoji-picker-react";

type Group = {
  id: string;
  label: string;
};

type ImageSize = {
  label: string;
  width: number;
  height: number;
};

const groups: Group[] = [
  { id: "zahrat", label: "الزهرات" },
  { id: "murshidat", label: "المرشدات" },
  { id: "dalilat", label: "الدليلات" },
];

const sizes: ImageSize[] = [
  {
    label: "إنستغرام 1350",
    width: 1080,
    height: 1350,
  },
  {
    label: "إنستغرام 1440",
    width: 1080,
    height: 1440,
  },
  {
    label: "ستوري 1920",
    width: 1080,
    height: 1920,
  },
];

function getOverlayPath(
  groupId: string,
  width: number,
  height: number,
): string {
  return `/overlays/${groupId}/${width}x${height}.png`;
}

type UploadedImage = {
  id: string;
  file: File;
  preview: string;
  result?: string;
  status: "waiting" | "processing" | "done";
};

type UploadedVideo = {
  id: string;
  name: string;
  file: File;
  preview: string;
  status: "ready" | "processing" | "done" | "error";
  error?: string;
};

export default function ImagesPage() {
  const [selectedTab, setSelectedTab] = useState<"images" | "videos">("images");
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ========== IMAGES ==========
  function handleImageFiles(files: FileList | null) {
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "waiting",
      }));

    setImages((previous) => [...previous, ...newImages]);
  }

  function removeImage(id: string) {
    setImages((previous) => previous.filter((image) => image.id !== id));
  }

  function clearImagesAll() {
    setImages([]);
  }

  async function generateImages() {
    if (!images.length) return;

    setIsProcessing(true);
    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      const currentImage = updatedImages[i];

      setImages((previous) =>
        previous.map((image) =>
          image.id === currentImage.id
            ? { ...image, status: "processing" }
            : image,
        ),
      );

      const result = await createFinalImage(
        currentImage.file,
        selectedGroup.id,
        selectedSize,
      );

      updatedImages[i] = {
        ...currentImage,
        result,
        status: "done",
      };

      setImages([...updatedImages]);
    }

    setIsProcessing(false);
  }

  function downloadImage(image: UploadedImage) {
    if (!image.result) return;

    const link = document.createElement("a");
    link.href = image.result;
    link.download = `summer-camp-${image.id}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadAllImages() {
    const readyImages = images.filter(
      (image) => image.status === "done" && image.result,
    );

    for (const image of readyImages) {
      downloadImage(image);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // ========== VIDEOS WITH OVERLAY ==========
  function handleVideoFiles(files: FileList | null) {
    if (!files) return;

    const newVideos: UploadedVideo[] = Array.from(files)
      .filter((file) => file.type.startsWith("video/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        preview: URL.createObjectURL(file),
        status: "ready",
      }));

    setVideos((previous) => [...previous, ...newVideos]);
  }

  async function processAndDownloadVideo(video: UploadedVideo) {
    try {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, status: "processing" } : v,
        ),
      );

      const overlayPath = getOverlayPath(
        selectedGroup.id,
        selectedSize.width,
        selectedSize.height,
      );

      // Get overlay image
      const overlayImg = await new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = overlayPath;
        },
      );

      // Create canvas and video element
      const canvas = document.createElement("canvas");
      canvas.width = selectedSize.width;
      canvas.height = selectedSize.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(video.file);
      videoElement.crossOrigin = "anonymous";

      // Setup MediaRecorder to capture canvas
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      // Wait for video to load
      await new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => resolve();
        videoElement.play().catch(() => {});
      });

      const videoDuration = videoElement.duration;

      // Start recording
      mediaRecorder.start();

      // Process video frame by frame
      const processFrame = () => {
        if (videoElement.currentTime < videoDuration) {
          // Draw video frame
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Draw overlay on top
          ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

          requestAnimationFrame(processFrame);
        } else {
          // Finish recording
          mediaRecorder.stop();
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        // Download
        const link = document.createElement("a");
        link.href = url;
        link.download = video.name.replace(/\.[^/.]+$/, ".webm");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(videoElement.src);

        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, status: "done" } : v)),
        );
      };

      // Start playback
      videoElement.play();
      processFrame();
    } catch (error) {
      console.error("Video processing error:", error);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id
            ? { ...v, status: "error", error: "خطأ في معالجة الفيديو" }
            : v,
        ),
      );
    }
  }

  function removeVideo(id: string) {
    setVideos((previous) => previous.filter((video) => video.id !== id));
  }

  function clearVideosAll() {
    setVideos([]);
  }

  return (
    <main className="min-h-screen bg-[#0f2a38] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            تجهيز صور كشاف الجياد
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/50">
            اختر الفرقة والمقاس ثم ارفع الصور والفيديوهات
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center border-b border-white/10">
          <button
            onClick={() => setSelectedTab("images")}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === "images"
                ? "text-[#c47d1a] border-b-2 border-[#c47d1a] -mb-[2px]"
                : "text-white/50 hover:text-white"
            }`}
          >
            📸 الصور
          </button>
          <button
            onClick={() => setSelectedTab("videos")}
            className={`px-4 py-2 font-medium transition ${
              selectedTab === "videos"
                ? "text-[#c47d1a] border-b-2 border-[#c47d1a] -mb-[2px]"
                : "text-white/50 hover:text-white"
            }`}
          >
            🎬 الفيديوهات
          </button>
        </div>

        {/* Group Selection */}
        <div className="flex flex-wrap gap-2 justify-center">
          {groups.map((group) => {
            const isSelected = selectedGroup.id === group.id;

            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isSelected
                    ? "bg-[#c47d1a] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {/* Size Selection */}
        <div className="flex flex-wrap gap-2 justify-center">
          {sizes.map((size) => {
            const isSelected =
              selectedSize.width === size.width &&
              selectedSize.height === size.height;

            return (
              <button
                key={size.label}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isSelected
                    ? "bg-[#9c6114] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {size.label}
              </button>
            );
          })}
        </div>

        {/* IMAGES TAB */}
        {selectedTab === "images" && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-[#9c6114]/40 bg-white/[0.02] p-8 sm:p-10 text-center transition hover:border-[#c47d1a] hover:bg-white/[0.04]"
            >
              <div className="flex justify-center mb-3">
                <Emoji unified="1f4f7" size={32} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold">أضف الصور</h2>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                اختر عدة صور في نفس الوقت
              </p>
              <button className="mt-4 px-5 py-2 rounded-lg bg-[#9c6114] text-white font-medium text-sm hover:bg-[#b38818] transition">
                اختيار
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => handleImageFiles(event.target.files)}
              />
            </div>

            {images.length > 0 && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-[#c47d1a]">
                        {selectedGroup.label}
                      </span>{" "}
                      • {images.length} صورة{" "}
                      {images.filter((i) => i.status === "done").length > 0 &&
                        `• ${images.filter((i) => i.status === "done").length} جاهزة`}
                    </p>
                  </div>
                  <button
                    onClick={clearImagesAll}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    حذف الكل
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/20"
                    >
                      <img
                        src={image.result || image.preview}
                        alt=""
                        onClick={() => {
                          if (image.status === "done" && image.result) {
                            setPreviewImage(image);
                          }
                        }}
                        className={`aspect-[3/4] w-full object-cover ${
                          image.status === "done" ? "cursor-pointer" : ""
                        }`}
                      />

                      {image.status === "processing" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#c47d1a]" />
                        </div>
                      )}

                      {image.status === "done" && image.result && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image);
                          }}
                          className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-3 py-1 text-xs font-medium transition hover:bg-[#9c6114]"
                        >
                          ⬇ تحميل
                        </button>
                      )}

                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute left-2 top-2 hidden group-hover:block rounded-full bg-black/70 px-2 py-1 text-xs font-medium"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
                  {images.some((image) => image.status === "done") && (
                    <button
                      onClick={downloadAllImages}
                      className="rounded-lg border border-[#c47d1a] px-5 py-2.5 font-medium text-[#c47d1a] transition hover:bg-[#9c6114] hover:text-white text-sm"
                    >
                      ⬇ تحميل الكل
                    </button>
                  )}

                  <button
                    onClick={generateImages}
                    disabled={isProcessing}
                    className="rounded-lg bg-[#c47d1a] px-6 py-2.5 font-medium text-white transition hover:bg-[#b8701b] disabled:opacity-60 text-sm"
                  >
                    {isProcessing
                      ? "جاري التجهيز..."
                      : `تجهيز (${images.length})`}
                  </button>
                </div>
              </>
            )}

            {previewImage && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                onClick={() => setPreviewImage(null)}
              >
                <div
                  className="relative max-w-xl max-h-[90vh] w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-10 right-0 text-white/60 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                  <img
                    src={previewImage.result || previewImage.preview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => downloadImage(previewImage)}
                      className="flex-1 rounded-lg bg-[#c47d1a] px-4 py-2 font-medium text-white text-sm hover:bg-[#b8701b]"
                    >
                      ⬇ تحميل
                    </button>
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="flex-1 rounded-lg bg-white/10 px-4 py-2 font-medium text-white text-sm hover:bg-white/15"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIDEOS TAB */}
        {selectedTab === "videos" && (
          <>
            <div
              onClick={() => videoInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-[#9c6114]/40 bg-white/[0.02] p-8 sm:p-10 text-center transition hover:border-[#c47d1a] hover:bg-white/[0.04]"
            >
              <div className="flex justify-center mb-3 text-4xl">🎬</div>
              <h2 className="text-lg sm:text-xl font-bold">أضف الفيديوهات</h2>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                سيتم تطبيق الإطار على الفيديو وتحميله
              </p>
              <button className="mt-4 px-5 py-2 rounded-lg bg-[#9c6114] text-white font-medium text-sm hover:bg-[#b38818] transition">
                اختيار
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                hidden
                onChange={(event) => handleVideoFiles(event.target.files)}
              />
            </div>

            {videos.length > 0 && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-[#c47d1a]">
                        {selectedGroup.label}
                      </span>{" "}
                      • {videos.length} فيديو
                    </p>
                  </div>
                  <button
                    onClick={clearVideosAll}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    حذف الكل
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/20"
                    >
                      <div className="aspect-[3/4] w-full bg-black">
                        <video
                          src={video.preview}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                          <span className="text-3xl">▶</span>
                        </div>
                      </div>

                      {video.status === "processing" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="text-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#c47d1a] mx-auto" />
                            <p className="text-xs text-white mt-2">
                              جاري المعالجة...
                            </p>
                          </div>
                        </div>
                      )}

                      {video.status === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
                          <span className="text-xs text-white text-center px-2">
                            {video.error}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => processAndDownloadVideo(video)}
                        disabled={video.status === "processing"}
                        className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-3 py-1 text-xs font-medium transition hover:bg-[#9c6114] disabled:opacity-50"
                      >
                        {video.status === "processing"
                          ? "جاري..."
                          : "⬇ معالجة وتحميل"}
                      </button>

                      <button
                        onClick={() => removeVideo(video.id)}
                        className="absolute left-2 top-2 hidden group-hover:block rounded-full bg-black/70 px-2 py-1 text-xs font-medium"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm text-white/70">
                  <p>
                    ⏱️ ملاحظة: معالجة الفيديو تحتاج وقت حسب طول الفيديو. يرجى
                    الانتظار...
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ========== LOCAL IMAGE PROCESSING ==========
async function createFinalImage(
  file: File,
  groupId: string,
  size: ImageSize,
): Promise<string> {
  const image = await loadImage(file);
  const overlayPath = getOverlayPath(groupId, size.width, size.height);
  const overlay = await loadImage(overlayPath);

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported");
  }

  const imageRatio = image.width / image.height;
  const canvasRatio = size.width / size.height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > canvasRatio) {
    sourceWidth = image.height * canvasRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / canvasRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    size.width,
    size.height,
  );

  context.drawImage(overlay, 0, 0, size.width, size.height);

  return canvas.toDataURL("image/jpeg", 0.95);
}

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    if (source instanceof File) {
      image.src = URL.createObjectURL(source);
    } else {
      image.src = source;
    }
  });
}

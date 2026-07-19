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

// Map group + size to overlay path
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

export default function ImagesPage() {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
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

  function clearAll() {
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

  return (
    <main className="min-h-screen bg-[#0f2a38] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            تجهيز صور كشاف الجياد
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/50">
            اختر الفرقة والمقاس ثم ارفع الصور
          </p>
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

        {/* Size Selection - Compact */}
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

        {/* Upload Area */}
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
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  <span className="text-[#c47d1a]">{selectedGroup.label}</span>{" "}
                  • {images.length} صورة{" "}
                  {images.filter((i) => i.status === "done").length > 0 &&
                    `• ${images.filter((i) => i.status === "done").length} جاهزة`}
                </p>
              </div>
              <button
                onClick={clearAll}
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

            {/* Action Buttons */}
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
                {isProcessing ? "جاري التجهيز..." : `تجهيز (${images.length})`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Image Preview Modal */}
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
    </main>
  );
}

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

  /*
   * Cover crop:
   * الصورة تملأ كامل الإطار بدون تشويه
   */
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

  /*
   * وضع الـ Overlay PNG فوق الصورة بالكامل
   */
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

"use client";

import React, { useState } from "react";

export default function ImageKitTestPage() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const e = React.createElement;

  const addLog = (message) => {
    console.log(message);
    setTestResults((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const clearLogs = () => setTestResults([]);

  const testAuthEndpoint = async () => {
    try {
      addLog("\n🧪 TEST 1: Testing Auth Endpoint");
      addLog("📡 Fetching /api/imagekit-auth...");

      const response = await fetch("/api/imagekit-auth");
      addLog(`📊 Status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        addLog(`❌ Failed! Response: ${text.substring(0, 200)}`);
        return null;
      }

      const data = await response.json();
      addLog(`✅ Success!`);
      addLog(`   ✓ token: ${data.token}`);
      addLog(`   ✓ expire: ${data.expire}`);
      addLog(`   ✓ signature: ${data.signature.substring(0, 20)}...`);
      addLog(`   ✓ publicKey: ${data.publicKey.substring(0, 20)}...`);

      return data;
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      return null;
    }
  };

  const testUpload = async () => {
    try {
      addLog("\n🧪 TEST 2: Testing File Upload");

      // Get auth params
      const authParams = await testAuthEndpoint();
      if (!authParams) {
        addLog("❌ Auth failed, skipping upload test");
        return;
      }

      // Create a tiny test file (1KB text file)
      const testContent =
        "This is a test file for ImageKit upload verification.";
      const testFile = new File([testContent], "test.txt", {
        type: "text/plain",
      });

      addLog(`\n📦 Creating FormData with:`);
      addLog(`   ✓ file: test.txt (${testFile.size} bytes)`);
      addLog(`   ✓ publicKey: ${authParams.publicKey.substring(0, 20)}...`);
      addLog(`   ✓ token: ${authParams.token}`);
      addLog(`   ✓ signature: ${authParams.signature.substring(0, 20)}...`);
      addLog(`   ✓ folder: /test-upload`);

      const formData = new FormData();
      formData.append("file", testFile);
      formData.append("publicKey", authParams.publicKey);
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);
      formData.append("folder", "/test-upload");

      addLog(`\n🚀 Uploading to ImageKit...`);
      const uploadResponse = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      addLog(`📊 Upload status: ${uploadResponse.status}`);

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        addLog(`❌ Upload failed!`);
        addLog(`Response: ${text.substring(0, 500)}`);
        return;
      }

      const uploadData = await uploadResponse.json();
      addLog(`✅ Upload successful!`);
      addLog(`   ✓ fileId: ${uploadData.fileId}`);
      addLog(`   ✓ filePath: ${uploadData.filePath}`);
      addLog(`   ✓ url: ${uploadData.url}`);
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const testVideoUpload = async () => {
    try {
      addLog("\n🧪 TEST 3: Testing Video File Upload");

      // Get auth params
      addLog("📡 Fetching auth parameters...");
      const authResponse = await fetch("/api/imagekit-auth");

      if (!authResponse.ok) {
        addLog(`❌ Auth failed with status ${authResponse.status}`);
        return;
      }

      const authParams = await authResponse.json();
      addLog(`✅ Auth successful`);

      // Simulate a small video file (we'll use a text file as a placeholder)
      const videoContent = "Video file placeholder for testing";
      const videoFile = new File([videoContent], "test-video.mp4", {
        type: "video/mp4",
      });

      addLog(`\n📦 Creating FormData for video:`);
      addLog(`   ✓ file: test-video.mp4 (${videoFile.size} bytes)`);
      addLog(`   ✓ folder: /uploads`);

      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("publicKey", authParams.publicKey);
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);
      formData.append("folder", "/uploads");

      addLog(`\n🚀 Uploading video to ImageKit...`);
      const uploadResponse = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      addLog(`📊 Upload status: ${uploadResponse.status}`);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        addLog(`❌ Video upload failed!`);

        try {
          const errorJson = JSON.parse(errorText);
          addLog(`Error: ${errorJson.message}`);
          if (errorJson.help) addLog(`Help: ${errorJson.help}`);
        } catch {
          addLog(`Response: ${errorText.substring(0, 300)}`);
        }
        return;
      }

      const uploadData = await uploadResponse.json();
      addLog(`✅ Video upload successful!`);
      addLog(`   ✓ fileId: ${uploadData.fileId}`);
      addLog(`   ✓ filePath: ${uploadData.filePath}`);
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f2a38] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">
          ImageKit Credentials Test
        </h1>
        <p className="text-white/50 mb-6">
          Test your ImageKit setup to diagnose upload issues
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => {
              setIsLoading(true);
              testAuthEndpoint().finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
          >
            Test 1: Auth Endpoint
          </button>

          <button
            onClick={() => {
              setIsLoading(true);
              testUpload().finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
          >
            Test 2: Text File Upload
          </button>

          <button
            onClick={() => {
              setIsLoading(true);
              testVideoUpload().finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
          >
            Test 3: Video File Upload
          </button>

          <button
            onClick={clearLogs}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
          >
            Clear Logs
          </button>
        </div>

        {/* Results */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <h2 className="text-lg font-bold text-white mb-3">📋 Test Results</h2>
          <div className="bg-black/50 rounded p-3 h-96 overflow-y-auto font-mono text-sm text-white/70">
            {testResults.length === 0 ? (
              <p className="text-white/40">
                Click a test button above to start...
              </p>
            ) : (
              testResults.map((log, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">What Each Test Does:</h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li>
              <strong>Test 1:</strong> Checks if your auth endpoint returns
              valid credentials
            </li>
            <li>
              <strong>Test 2:</strong> Uploads a small text file to verify
              ImageKit accepts your credentials
            </li>
            <li>
              <strong>Test 3:</strong> Simulates a video file upload to see the
              exact error
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

// components/Scanner.tsx
"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function Scanner({ onScanSuccess }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent duplicate scanner instances in React Strict Mode
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.75);
          return { width: size, height: size };
        },
        formatsToSupport: [Html5QrcodeSupportedFormats.DATA_MATRIX],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true, // Uses native OS hardware acceleration on Android Chrome
        },
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Frame analysis errors ignored
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Container where html5-qrcode mounts video & canvas */}
      <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border border-gray-300 shadow-sm" />
      
      {/* Target CSS overrides to keep camera feed square and un-stretched */}
      <style jsx global>{`
        #reader video {
          object-fit: cover !important;
          border-radius: 0.5rem;
        }
        #reader__dashboard {
          padding: 8px !important;
        }
        #reader__button_camera_permission,
        #reader__button_camera_start,
        #reader__button_camera_stop {
          background-color: #059669 !important;
          color: white !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          border: none !important;
          margin-top: 8px !important;
        }
      `}</style>
    </div>
  );
}
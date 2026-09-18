// components/Scanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function Scanner({ onScanSuccess }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {

      // Clean up previous streams/instances
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }

      // Clear DOM container to prevent stacked video feeds
      const container = document.getElementById("reader");
      if (container) {
        container.innerHTML = "";
      }

      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      const config = {
        fps: 10, // Smooth frame rate for mobile & low-power Windows CPUs
        
        formatsToSupport: [Html5QrcodeSupportedFormats.DATA_MATRIX], // Strict focus on Data Matrix
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true, // Native Shape Detection API (Lightning fast on Chrome/Android)
        },
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
        },
      };

      await html5Qrcode.start(
      { facingMode: "environment" }, // Exactly 1 key here!
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        () => {
          // Frame seeking errors ignored intentionally
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start camera scanner:", err);
      alert("Could not start camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Relative container holding both video feed and visual overlay */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden border border-gray-300 min-h-[280px]">
        {/* Video stream container */}
        <div id="reader" className="w-full h-full [&_video]:filter [&_video]:grayscale [&_video]:contrast-200 [&_video]:brightness-90"  />

        {/* Visual Target Overlay (Only visible when actively scanning) */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Guide Box Frame */}
            <div className="relative w-56 h-56 border-2 border-emerald-500/60 rounded-lg bg-emerald-500/5">
              {/* Corner Indicators */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-500" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-500" />

              {/* Text Hint */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/60 px-2.5 py-1 rounded-full whitespace-nowrap">
                Position Data Matrix inside box
              </span>
            </div>
          </div>
        )}
      </div>

      {!isScanning ? (
        <button
          onClick={startScanner}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          Start Camera Scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          Stop Camera
        </button>
      )}
    </div>
  );
}
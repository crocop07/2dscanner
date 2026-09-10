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
      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      const config = {
        fps: 15, // Smooth frame rate for mobile & low-power Windows CPUs
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          // Dynamic responsive scan area based on screen size
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.7);
          return { width: size, height: size };
        },
        formatsToSupport: [Html5QrcodeSupportedFormats.DATA_MATRIX], // Strict focus on Data Matrix
        videoConstraints: {
          facingMode: { ideal: "environment" },
          width: { min: 640, ideal: 1280, max: 1920 }, // Prevents over-stretching mobile CPU
          height: { min: 480, ideal: 720, max: 1080 },
        },
      };

      await html5Qrcode.start(
        { facingMode: "environment" },
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
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
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
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div
        id="reader"
        className="w-full bg-black rounded-lg overflow-hidden border border-gray-300 min-h-[280px]"
      />
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
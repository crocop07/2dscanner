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

      await html5Qrcode.start(
        { facingMode: "environment" }, // Prefers rear camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [Html5QrcodeSupportedFormats.DATA_MATRIX], // 2D Data Matrix
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner(); // Stop scanning once a code is read
        },
        (errorMessage) => {
          // Frame match errors are normal while seeking a barcode
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
        className="w-full bg-black rounded-lg overflow-hidden border border-gray-300 min-h-[250px]"
      />
      {!isScanning ? (
        <button
          onClick={startScanner}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Start Camera Scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Stop Camera
        </button>
      )}
    </div>
  );
}
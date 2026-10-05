"use client";

import { useEffect, useRef, useState } from "react";
import { BarcodeDetector } from "barcode-detector/ponyfill";

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function Scanner({ onScanSuccess }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
  };

  const startScanner = async () => {
    try {
      const detector = new BarcodeDetector({ formats: ["data_matrix"] });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setIsScanning(true);

      let busy = false;
      const tick = async () => {
        if (!streamRef.current) return;
        if (!busy) {
          busy = true;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              onScanSuccess(codes[0].rawValue);
              stopScanner();
              return;
            }
          } catch {
            // ignore frames that fail to decode
          }
          busy = false;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      console.error("Failed to start camera:", err);
      alert("Could not start camera. Please check permissions.");
      stopScanner();
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="relative w-full bg-black rounded-lg overflow-hidden border border-gray-300 min-h-[280px]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-emerald-500/60 rounded-lg" />
          </div>
        )}
      </div>

      {!isScanning ? (
        <button
          onClick={startScanner}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg"
        >
          Start Camera Scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-lg"
        >
          Stop Camera
        </button>
      )}
    </div>
  );
}
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
  const onScanRef =useRef(onScanSuccess);
 // const lastValue = useRef("");
  //const lastSeen = useRef(0);
  const lastSeenMap = useRef(new Map<string, number>());
  const cropRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    onScanRef.current = onScanSuccess;
  }, [onScanSuccess]);

  const stopScanner = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    //lastValue.current = "";  delete if working
    lastSeenMap.current.clear();
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

      const track = stream.getVideoTracks()[0];
      track.addEventListener("ended", () => console.log("camera track ENDED"));
      track.addEventListener("mute", () => console.log("camera track MUTED"));

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      video.addEventListener("pause", () => console.log("video PAUSED"));
      setIsScanning(true);

      let busy = false;
      const tick = async () => {
        if (!streamRef.current) return;
        if (!busy) {
          busy = true;
          try {
           const vw = video.videoWidth;
            const vh = video.videoHeight;
            const boxW = video.clientWidth;
            const boxH = video.clientHeight;

            if (!vw || !vh || !boxW || !boxH) throw new Error("video not ready");

            // object-cover scales the video to fill the box, then crops the overflow
            const scale = Math.max(boxW / vw, boxH / vh);
            const sw = boxW / scale; // visible width in video pixels
            const sh = boxH / scale; // visible height in video pixels
            const sx = (vw - sw) / 2;
            const sy = (vh - sh) / 2;

            const canvas = (cropRef.current ??= document.createElement("canvas"));
            canvas.width = sw;
            canvas.height = sh;
            canvas.getContext("2d")!.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

            const codes = await detector.detect(canvas); 




            const now = Date.now();
          for (const code of codes) {
  const value = code.rawValue;
  const last = lastSeenMap.current.get(value) ?? 0;
  lastSeenMap.current.set(value, now);
  if (now - last > 2000) onScanRef.current(value);
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
      <div className="relative w-full bg-black rounded-lg overflow-hidden border border-gray-300 h-64">
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
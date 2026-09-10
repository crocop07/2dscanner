// /components/BarcodeGenerator.tsx
"use client";

import { useEffect, useRef } from "react";
import bwipjs from "bwip-js";

interface BarcodeGeneratorProps {
  payload: string;
}

export default function BarcodeGenerator({ payload }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && payload) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "datamatrix", // 2D Data Matrix format
          text: payload,      // Raw payload string
          scale: 4,           // High DPI crispness
          paddingwidth: 10,     // Left & right quiet zone (in points)
          paddingheight: 10,    // Top & bottom quiet zone (in points)
          
        });
      } catch (err) {
        console.error("Barcode rendering error:", err);
      }
    }
  }, [payload]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const imageURI = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURI;
    link.download = `2d_code_barcode_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <canvas ref={canvasRef} className="max-w-[180px] h-auto border border-gray-100 rounded" />
      <button
        onClick={handleDownloadPNG}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
      >
        Download PNG
      </button>
    </div>
  );
}
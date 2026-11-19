"use client";

import { useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js";

interface BarcodeGeneratorProps {
  payload: string;
  label?: string; // optional text shown above the barcode in the copied image
}

export default function BarcodeGenerator({ payload, label }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (canvasRef.current && payload) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "datamatrix",
          text: payload,
          scale: 4,
          paddingwidth: 10,
          paddingheight: 10,
          backgroundcolor: "FFFFFF",
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

  // Builds the image to copy: the barcode, with the label above it if there is one
  function buildCopyCanvas(): HTMLCanvasElement {
    const source = canvasRef.current!;
    if (!label) return source;

    const bandHeight = 40;
    const out = document.createElement("canvas");
    out.width = source.width;
    out.height = source.height + bandHeight;

    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, out.width, out.height);

    // start big, shrink the font until the text fits the width
    let fontSize = 28;
    ctx.font = `bold ${fontSize}px monospace`;
    while (fontSize > 10 && ctx.measureText(label).width > out.width * 0.9) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px monospace`;
    }

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, out.width / 2, bandHeight / 2);
    ctx.drawImage(source, 0, bandHeight);
    return out;
  }

  function flashStatus(status: "copied" | "failed") {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setCopyStatus(status);
    resetTimer.current = setTimeout(() => setCopyStatus("idle"), 2500);
  }

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const canvas = buildCopyCanvas();

    try {
      const blobPromise = new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject()), "image/png");
      });

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blobPromise }),
      ]);
      flashStatus("copied");
    } catch (err) {
      console.error("copy failed:", err);
      flashStatus("failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <canvas ref={canvasRef} className="max-w-[180px] h-auto border border-gray-100 rounded" />
      <div className="flex w-full gap-2">
        <button
          onClick={handleDownloadPNG}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
        >
          Download PNG
        </button>
        <button
          onClick={handleCopyImage}
          className={`flex-1 font-semibold py-2 px-4 rounded transition-colors text-sm text-white ${
            copyStatus === "copied"
              ? "bg-green-600"
              : copyStatus === "failed"
              ? "bg-red-600"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          {copyStatus === "copied"
            ? "Copied!"
            : copyStatus === "failed"
            ? "Failed: use Download"
            : "Copy image"}
        </button>
      </div>
    </div>
  );
}
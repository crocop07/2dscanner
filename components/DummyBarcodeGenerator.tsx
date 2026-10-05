// /components/DummyBarcodeGenerator.tsx
"use client";

import { useState } from "react";

interface DummyBarcodeGeneratorProps {
  scannedMcsl?: string;
}

export default function DummyBarcodeGenerator({ scannedMcsl = "" }: DummyBarcodeGeneratorProps) {
  const [mcslInput, setMcslInput] = useState(scannedMcsl);
  const [displayText, setDisplayText] = useState("");

  const handleGenerate = () => {
    if (!mcslInput.trim()) return;
    setDisplayText(`${mcslInput.trim()} OK Working`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">Simple MCSL Check</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={mcslInput}
          onChange={(e) => setMcslInput(e.target.value)}
          placeholder="Enter MCSL / DOSL"
          className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleGenerate}
          className="px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition"
        >
          Generate
        </button>
      </div>

      {displayText && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-mono text-sm font-semibold text-center">
          {displayText}
        </div>
      )}
    </div>
  );
}
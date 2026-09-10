// app/page.tsx
"use client";

import { useState } from "react";
import { parse2DCodePayload } from "@/lib/parse";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import Scanner from "@/components/Scanner";

export default function Home() {
  const [inputPayload, setInputPayload] = useState("");
  const parsedData = parse2DCodePayload(inputPayload);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            2D Code Auditor & Generator
          </h1>
          <p className="text-sm text-gray-600">
            Scan or paste a Data Matrix payload to verify string length and extract crisp PNG barcodes.
          </p>
        </header>

        {/* Camera Scanner Component */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">1. Live Camera Scanner</h2>
          <Scanner onScanSuccess={(scannedText) => setInputPayload(scannedText)} />
        </section>

        {/* Manual Input & Verification Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">2. Payload Inspector</h2>
            
            {/* Real-time Status Badge */}
            {inputPayload && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  parsedData.isValid220
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {parsedData.isValid220
                  ? "VALID (220 Chars)"
                  : `INVALID (${parsedData.length} Chars)`}
              </span>
            )}
          </div>

          <textarea
            rows={4}
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
            placeholder="Paste raw payload string here or scan above..."
            className="w-full p-3 font-mono text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
          />

          {/* Parsed Fields Summary */}
          {inputPayload && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">Format / Class</span>
                <span className="font-mono text-gray-800">{parsedData.formatClass}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Postcode / DPS</span>
                <span className="font-mono text-gray-800">{parsedData.postcodeDPS}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium">Item Tracking ID</span>
                <span className="font-mono text-gray-800">{parsedData.itemId}</span>
              </div>
            </div>
          )}
        </section>

        {/* Barcode Generator & Download Section */}
        {inputPayload && (
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 text-center">
            <h2 className="text-lg font-semibold text-gray-800">3. 2D Data Matrix Output</h2>
            <BarcodeGenerator payload={inputPayload} />
          </section>
        )}

      </div>
    </main>
  );
}
// app/page.tsx
"use client";

import { useState } from "react";
import { parse2DCodePayload } from "@/lib/parse";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import Scanner from "@/components/Scanner";
import { generateDummyPayloadWithMcsl } from "@/lib/generator";

export default function Home() {
  const [inputPayload, setInputPayload] = useState("");
  
  // 1. Parse raw payload string
  const parsedData = parse2DCodePayload(inputPayload);

  // 2. Build 220-char dummy payload containing extracted MCSL (offsets 45-58)
  const dummyPayload = generateDummyPayloadWithMcsl(parsedData.indexIdMcsl);

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
                  parsedData.isValid
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {parsedData.isValid
                  ? "VALID Label"
                  : `INVALID Label)`}
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

          {/* Validation Checks */}
{inputPayload && (
  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm space-y-1">
    <div className={parsedData.isValid220 ? "text-green-700" : "text-red-700"}>
      {parsedData.isValid220 ? "✓" : "✗"} Length: {parsedData.length} characters (expected 220)
    </div>
    <div className={parsedData.isValidMcslDosl ? "text-green-700" : "text-red-700"}>
      {parsedData.isValidMcslDosl ? "✓" : "✗"} MCSL/DOSL at positions 46-58:{" "}
      <span className="font-mono">{parsedData.indexIdMcsl || "N/A"}</span>
    </div>
  </div>
)}

          {/* Parsed Fields Summary */}
          {inputPayload && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <div>
                <span className="block text-xs text-gray-500 font-medium">Country / Version</span>
                <span className="font-mono text-gray-800">
                  {parsedData.upuCountryId.trim() || "N/A"} {parsedData.informationTypeId.trim()} {parsedData.versionId.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium font-bold text-blue-600">
                  MCSL / DOSL Index ID
                </span>
                <span className="font-mono text-gray-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block">
                  {parsedData.indexIdMcsl.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Barcode ID </span>
                <span className="font-mono text-gray-800">
                  {parsedData.barcodeId.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Sending OBIID </span>
                <span className="font-mono text-gray-800">
                  {parsedData.sendingObiId.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Sending Location ID </span>
                <span className="font-mono text-gray-800">
                  {parsedData.sendingFunctionalLocationId.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Priority Spec </span>
                <span className="font-mono text-gray-800">
                  {parsedData.prioritySpecification.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Date of Production </span>
                <span className="font-mono text-gray-800">
                  {parsedData.dateOfProduction.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Processing Function </span>
                <span className="font-mono text-gray-800">
                  {parsedData.processingFunction.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Receiving Office 1 Name</span>
                <span className="font-mono text-gray-800">
                  {parsedData.receivingOffice1.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Receiving Office 2 Postcode</span>
                <span className="font-mono text-gray-800">
                  {parsedData.receivingOffice2.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Hub Name </span>
                <span className="font-mono text-gray-800">
                  {parsedData.hubName.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Lane Code </span>
                <span className="font-mono text-gray-800">
                  {parsedData.laneCode.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Tracked Code </span>
                <span className="font-mono text-gray-800">
                  {parsedData.trackedCode.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Hub Code</span>
                <span className="font-mono text-gray-800">
                  {parsedData.hubCode.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Local Seg Code </span>
                <span className="font-mono text-gray-800">
                  {parsedData.localSegCode.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Content </span>
                <span className="font-mono text-gray-800">
                  {parsedData.content.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Route 1</span>
                <span className="font-mono text-gray-800">
                  {parsedData.route1.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Dispatching Office</span>
                <span className="font-mono text-gray-800">
                  {parsedData.dispatchingOffice.trim() || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-500 font-medium">Reorder code</span>
                <span className="font-mono text-gray-800">
                  {parsedData.reorderBarcodeCode1D.trim() || "N/A"}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Barcode Generator & Download Section - Side by Side */}
        {inputPayload && (
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 text-center">3. 2D Data Matrix Output</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Original Scanned Barcode */}
              <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Original Scanned Code
                </span>
                <BarcodeGenerator payload={inputPayload} />
              </div>

              {/* Right Column: Clean Generated Dummy Barcode */}
              <div className="flex flex-col items-center gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200 text-center">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Generated Dummy Code (MCSL: {parsedData.indexIdMcsl || "N/A"})
                </span>
                <BarcodeGenerator payload={dummyPayload} />
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
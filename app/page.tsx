// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { parse2DCodePayload } from "@/lib/parse";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import Scanner from "@/components/Scanner";
import { generateDummyPayloadWithMcsl } from "@/lib/generator";

interface ScanEntry {
  raw: string;
  mailcentre: string;
  mcsl: string;
  postcodes: string;
  isValid: boolean;
  id: string;
}

export default function Home() {
  const [inputPayload, setInputPayload] = useState("");
  const [showScanner, setShowScanner] = useState(true);

  const [idType, setIDType] = useState<"MCSL" | "DOSL">("MCSL");
  const [digits, setDigits] = useState("");
  const [toast, setToast] = useState<{ type: "ok" | "error" | "dup"; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scans, setScans] = useState<ScanEntry[]>([]);
  // const seen = useRef(new Set<string>()); delete if working

  const digitsValid = /^\d{9}$/.test(digits);
  const typedLabel = digitsValid ? generateDummyPayloadWithMcsl(idType + digits) : null;

  const [loaded, setLoaded] = useState(false);

  // Load saved scans once, when the page first opens
useEffect(() => {
  try {
    const saved = sessionStorage.getItem("scans");
    if (saved) {
      const parsed: ScanEntry[] = JSON.parse(saved);
      setScans(parsed);
      // parsed.forEach((s) => seen.current.add(s.raw)); delete if working
    }
  } catch {
    // ignore corrupted or blocked storage
  }
  setLoaded(true);
}, []);

// Save whenever the list changes (but only after the load has happened)
useEffect(() => {
  if (!loaded) return;
  try {
    sessionStorage.setItem("scans", JSON.stringify(scans));
  } catch {
    // ignore if storage is full or blocked
  }
}, [scans, loaded]);

  function showToast(type: "ok" | "error" | "dup", message: string) {
  if (toastTimer.current) clearTimeout(toastTimer.current);
  setToast({ type, message });
  toastTimer.current = setTimeout(() => setToast(null), 2500);
  if (type !== "ok") navigator.vibrate?.(200); // does nothing on desktop
}

function handleScan(scannedText: string) {
  setInputPayload(scannedText);

  const parsed = parse2DCodePayload(scannedText);

  setScans((prev) => [
    {
      id: crypto.randomUUID(),
      raw: scannedText,
      mailcentre: parsed.receivingOffice1.trim(),
      mcsl: parsed.indexIdMcsl.trim(),
      postcodes: parsed.receivingOffice2.trim(),
      isValid: parsed.isValid,
    },
    ...prev,
  ]);

  if (!parsed.isValid220) {
    showToast("error", `Wrong length: ${parsed.length} characters (expected 220)`);
  } else if (!parsed.isValidMcslDosl) {
    showToast("error", "No valid MCSL/DOSL found");
  } else {
    showToast("ok", `Scanned ${parsed.indexIdMcsl.trim()}`);
  }
}
  
  
  // 1. Parse raw payload string
  const parsedData = parse2DCodePayload(inputPayload);

  // 2. Build 220-char dummy payload containing extracted MCSL (offsets 45-58)
  const dummyPayload = generateDummyPayloadWithMcsl(parsedData.indexIdMcsl);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">

    {toast && (
  <div
    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold ${
      toast.type === "ok"
        ? "bg-green-600 text-white"
        : toast.type === "dup"
        ? "bg-amber-500 text-white"
        : "bg-red-600 text-white"
    }`}
  >
    {toast.message}
  </div>
)}

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            2D Code Auditor & Generator
          </h1>
          <p className="text-sm text-gray-600">
            Scan or paste a Data Matrix payload to verify string length and extract PNG barcodes.
          </p>
        </header>

      {/* Quick Create from MCSL / DOSL */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
  <h2 className="text-lg font-semibold text-gray-800">Quick Create from MCSL / DOSL</h2>

  <div className="flex gap-2">
    <select
      value={idType}
      onChange={(e) => setIDType(e.target.value as "MCSL" | "DOSL")}
      className="p-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
    >
      <option>MCSL</option>
      <option>DOSL</option>
    </select>
    <input
      value={digits}
      inputMode="numeric"
      maxLength={9}
      placeholder="9 digits"
      onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 9))}
      className="flex-1 p-2 font-mono border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />

            {digits.length > 0 &&(
              <button 
              onClick={() => setDigits("")
              }
              className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
              >Clear

              </button>
            )}
  </div>

  {digits && !digitsValid && (
    <p className="text-xs text-red-700">Enter exactly 9 digits</p>
  )}

  {typedLabel && (
    <div className="flex flex-col items-center gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200 text-center">
      <span className="text-2xl font-mono font-bold">{idType + digits}</span>
      <BarcodeGenerator payload={typedLabel} />
    </div>
  )}
</section>

        {/* Camera Scanner Component */}
     <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">1. Live Camera Scanner</h2>
          <button
            onClick={() => setShowScanner((s) => !s)}
            className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            {showScanner ? "Hide" : "Show"}
          </button>
        </div>
        {showScanner && <Scanner onScanSuccess={handleScan} />}
        
        </section>

        {/* Session list */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold text-gray-800">
      Scanned this session ({scans.length})
    </h2>
    {scans.length > 0 && (
      <button
        onClick={() => {
          setScans([]);
         // seen.current.clear(); delete if working
        }}
        className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
      >
        Clear list
      </button>
    )}
  </div>

  {scans.length === 0 ? (
    <p className="text-sm text-gray-500">Nothing scanned yet.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="py-1 pr-3">Mailcentre</th>
            <th className="py-1 pr-3">MCSL/DOSL</th>
            <th className="py-1 pr-3">Postcodes</th>
            <th className="py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((s) => (
            <tr key={s.id} className="border-t border-gray-100">
              <td className="py-2 pr-3">{s.mailcentre || "N/A"}</td>
              <td className="py-2 pr-3 font-mono">{s.mcsl || "N/A"}</td>
              <td className="py-2 pr-3 font-mono">{s.postcodes || "N/A"}</td>
              <td className="py-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    s.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {s.isValid ? "VALID" : "INVALID"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

        {/* Manual Input & Verification Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">2. Payload Inspector</h2>
            
            {/* Real-time Status Badge */}
            {inputPayload && (
             <div className="flex items-center gap-2">
             <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  parsedData.isValid
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {parsedData.isValid
                  ? "VALID LABEL"
                  : "INVALID LABEL"}
              </span>
              
              <button 
              onClick={() => setInputPayload("")}
              className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
              >Clear

              </button>
            </div>
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
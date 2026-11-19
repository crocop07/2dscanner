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

const MAX_BATCH = 10; // max number of selectable MSCL's from the scanned list

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

export default function Home() {
  const [inputPayload, setInputPayload] = useState("");
  const [showScanner, setShowScanner] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  const [idType, setIDType] = useState<"MCSL" | "DOSL">("MCSL");
  const [digits, setDigits] = useState("");
  const [toast, setToast] = useState<{ type: "ok" | "error" | "dup"; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batch, setBatch] = useState<ScanEntry[]>([]);

  const selectedScans = scans.filter((s)=> selectedIds.includes(s.id));
  const digitsValid = /^\d{9}$/.test(digits);
  const typedLabel = digitsValid ? generateDummyPayloadWithMcsl(idType + digits) : null;

  const [loaded, setLoaded] = useState(false);
  

  // remember useEffect runs automatically at the start, and is triggered when the variables change e.g. below will run when selectedIds is updated
  useEffect(() => {
  }, [selectedIds]);

  //Check the batck log
  useEffect(() => {
}, [batch]);


  // Load saved scans once, when the page first opens. 
useEffect(() => {
  try {
    const saved = sessionStorage.getItem("scans");
    if (saved) {
      const parsed: ScanEntry[] = JSON.parse(saved); // parsed is set to ScanEntry[data in saved] 
      setScans(parsed);
     
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
  if (type === "ok") {  //IF scan is ok vibrate
  navigator.vibrate?.(60); // short buzz for a good scan
} else {
  navigator.vibrate?.([150, 80, 150]); // double buzz for errors
}
}

function handleScan(scannedText: string) {
  setInputPayload(scannedText); //put payload into the text input box

  const parsed = parse2DCodePayload(scannedText); //Runs the scanned text through parser method

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
  
function toggleSelected(id: string) {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
}
  
  // 1. Parse raw payload string
  const parsedData = parse2DCodePayload(inputPayload);

  // 2. Build 220-char dummy payload containing extracted MCSL (offsets 45-58)
  const dummyPayload = generateDummyPayloadWithMcsl(parsedData.indexIdMcsl);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">


 {/* && means if toast is null or underfined dont run*/}
    {toast && (
  <div
    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold ${
      toast.type === "ok" 
        ? "bg-green-600 text-white" //if ok use green
        : toast.type === "dup"
        ? "bg-amber-500 text-white" //else if uae amber
        : "bg-red-600 text-white" // else red
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
            <Chevron open={showScanner} />
          </button>
        </div>
        {showScanner && <Scanner onScanSuccess={handleScan} />}
        
        </section>

        {/* Session list */}
<section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">
        Scanned this session ({scans.length})
      </h2>
      <p className="text-sm text-gray-600">
        {selectedIds.length} / {MAX_BATCH} selected
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setBatch(selectedScans)}
        disabled={selectedScans.length === 0}
        className="flex-1 sm:flex-none px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Generate dummies
      </button>

      {scans.length > 0 && (
        <button
          onClick={() => {
            setScans([]);
            setSelectedIds([]);
          }}
          className="flex-1 sm:flex-none px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
        >
          Clear list
        </button>
      )}
    </div>
  </div>

  {scans.length === 0 ? (
    <p className="text-sm text-gray-500">Nothing scanned yet.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="py-1 pr-2 w-8"></th>
            <th className="py-1 pr-2">Mailcentre / MCSL</th>
            <th className="py-1 pr-2 hidden sm:table-cell">Postcodes</th>
            <th className="py-1 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((s) => (
            <tr key={s.id} className="border-t border-gray-100 align-middle">
              <td className="py-2 pr-2">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggleSelected(s.id)}
                  disabled={
                    !s.isValid ||
                    (!selectedIds.includes(s.id) && selectedIds.length >= MAX_BATCH)
                  }
                />
              </td>
              <td className="py-2 pr-2">
                <div className="font-medium leading-tight">{s.mailcentre || "N/A"}</div>
                <div className="font-mono text-xs text-gray-500">{s.mcsl || "N/A"}</div>
                <div className="font-mono text-xs text-gray-400 sm:hidden">{s.postcodes || "N/A"}</div>
              </td>
              <td className="py-2 pr-2 font-mono text-xs hidden sm:table-cell">
                {s.postcodes || "N/A"}
              </td>
              <td className="py-2 text-right">
                <span
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${
                    s.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  <span className="sm:hidden">{s.isValid ? "✓" : "✕"}</span>
                  <span className="hidden sm:inline">{s.isValid ? "VALID" : "INVALID"}</span>
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
         <div className="space-y-3">
          <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold text-gray-800">2. Payload Inspector</h2>
          
          <button
           onClick={() => setShowInspector((s) => !s)}
           disabled={!inputPayload}
            aria-expanded={showInspector}
           className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
            >
          
          <Chevron open={showInspector} />
          </button>
  </div>
            
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

{showInspector && (
  <>

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

          </>
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


      {batch.length > 0 && (
  <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
    <h2 className="text-lg font-semibold text-gray-800">Batch dummies ({batch.length})</h2>

    <button onClick={()=>setBatch([])}
      className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100">
        Clear Batch
      </button>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {batch.map((s) => (
        <div key={s.id} className="flex flex-col items-center gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200 text-center">
          <span className="font-mono font-bold">{s.mcsl}</span>
          <BarcodeGenerator payload={generateDummyPayloadWithMcsl(s.mcsl)} />
        </div>
      ))}
    </div>
  </section>
)}

      </div>
    </main>
  );
}
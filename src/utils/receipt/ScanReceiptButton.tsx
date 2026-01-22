// import { useState } from "react";

// interface ScanReceiptButtonProps {
//   onScanComplete: (text: string) => void;
// }

// export default function ScanReceiptButton({
//   onScanComplete,
// }: ScanReceiptButtonProps) {
//   const [loading, setLoading] = useState(false);

//   const handleFileUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("receipt", file);

//       const res = await fetch(
//         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-receipt`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await res.json();
//       console.log("OCR RESPONSE:", data);
//       onScanComplete(data.text || "");
//     } catch (err) {
//       console.error("OCR failed", err);
//       alert("Could not read receipt. Please enter manually.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-end gap-1">
//       <label
//         className={`text-sm font-bold cursor-pointer transition-colors ${
//           loading
//             ? "text-gray-400 cursor-not-allowed"
//             : "text-emerald-500 hover:underline"
//         }`}
//       >
//         {loading ? "Scanning…" : "📸 Scan Receipt"}
//         <input
//           type="file"
//           accept="image/*"
//           hidden
//           onChange={handleFileUpload}
//           disabled={loading}
//         />
//       </label>

//       <span className="text-[10px] text-gray-400 uppercase tracking-widest">
//         Auto-fills from bill
//       </span>
//     </div>
//   );
// }


import { useState } from "react";
import Tesseract from "tesseract.js";

interface ScanReceiptButtonProps {
  onScanComplete: (text: string) => void;
}

export default function ScanReceiptButton({
  onScanComplete,
}: ScanReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      console.log("FILE:", file.name, file.type, file.size);

    const result = await Tesseract.recognize(
  file,
  "eng",
  {
    logger: () => {},
    tessedit_char_whitelist:
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ₹.:/-",
  } as any
);


      const text = result.data.text || "";
      console.log("OCR TEXT:", text);

      if (!text.trim()) {
        alert(
          "No text detected.\nTry a clearer photo with good lighting."
        );
        return;
      }

      onScanComplete(text);
    } catch (err) {
      console.error("OCR failed", err);
      alert("Could not read receipt. Please enter manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <label
        className={`text-sm font-bold cursor-pointer transition-colors ${
          loading
            ? "text-gray-400 cursor-not-allowed"
            : "text-emerald-500 hover:underline"
        }`}
      >
        {loading ? "Scanning…" : "📸 Scan Receipt"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileUpload}
          disabled={loading}
        />
      </label>

      <span className="text-[10px] text-gray-400 uppercase tracking-widest">
        Auto-fills from bill
      </span>
    </div>
  );
}

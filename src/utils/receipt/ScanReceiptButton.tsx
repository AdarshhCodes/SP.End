import { useState } from "react";

interface ScanReceiptButtonProps {
  onScanComplete: (text: string) => void;
}

export default function ScanReceiptButton({
  onScanComplete,
}: ScanReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // MOCK OCR — intentional for MVP
    setTimeout(() => {
      const mockOCRText = `
      Domino's Pizza
      Order No: 4567
      Total Amount: ₹349.00
      Date: 16/01/2026
      `;

      onScanComplete(mockOCRText);
      setLoading(false);
    }, 800);
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

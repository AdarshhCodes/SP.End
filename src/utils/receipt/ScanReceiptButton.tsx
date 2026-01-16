import React from "react";

interface ScanReceiptButtonProps {
  onScanComplete: (text: string) => void;
}

const ScanReceiptButton: React.FC<ScanReceiptButtonProps> = ({
  onScanComplete,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TEMP: mock OCR text (backend will replace this later)
    const mockOCRText = `
    Domino's Pizza
    Order No: 4567
    Total Amount: ₹349.00
    Date: 16/01/2026
    `;

    onScanComplete(mockOCRText);
  };

  return (
    <label style={{ cursor: "pointer" }}>
      📸 Scan Receipt
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileUpload}
      />
    </label>
  );
};

export default ScanReceiptButton;

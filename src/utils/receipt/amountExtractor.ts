export function extractAmount(text: string) {
  const patterns = [
    /total\s*[:\-]?\s*₹?\s?(\d+[.,]?\d*)/i,
    /amount\s*[:\-]?\s*₹?\s?(\d+[.,]?\d*)/i,
    /grand\s*total\s*₹?\s?(\d+[.,]?\d*)/i,
    /₹\s?(\d+[.,]?\d*)/,
    /rs\.?\s?(\d+[.,]?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        value: match[1].replace(",", ""),
        confidence: "HIGH" as const,
      };
    }
  }

  return {
    value: null,
    confidence: "LOW" as const,
  };
}

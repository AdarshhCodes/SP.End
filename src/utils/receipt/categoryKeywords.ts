const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    "restaurant",
    "cafe",
    "coffee",
    "pizza",
    "burger",
    "domino",
    "kfc",
    "zomato",
    "swiggy",
    "hotel",
  ],
  Shopping: ["amazon", "flipkart", "mall", "store", "shopping"],
  Travel: ["uber", "ola", "flight", "bus", "train", "metro"],
  Bills: ["electricity", "water", "bill", "recharge", "internet"],
};

export function detectCategory(text: string) {
  const lower = text.toLowerCase();

  for (const category in CATEGORY_KEYWORDS) {
    if (
      CATEGORY_KEYWORDS[category].some(keyword =>
        lower.includes(keyword)
      )
    ) {
      return { value: category, confidence: "HIGH" as const };
    }
  }

  return { value: "Other", confidence: "LOW" as const };
}

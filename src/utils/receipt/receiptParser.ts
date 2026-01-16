// src/utils/receipt/receiptParser.ts

import {
  ParsedReceipt,
  ReceiptField,
  ExpenseCategory,
} from "./receiptTypes";
import { CATEGORY_KEYWORDS } from "./receiptCategories";
import {
  getAmountConfidence,
  getMerchantConfidence,
  getCategoryConfidence,
  getDateConfidence,
} from "./receiptConfidence";

/**
 * Public function — this is the only export UI / backend will use later
 */
export function parseReceiptText(rawText: string): ParsedReceipt {
  const normalizedText = rawText.toUpperCase();
  const lines = normalizedText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const amount = extractAmount(lines);
  const merchantName = extractMerchant(lines);
  const date = extractDate(lines);
  const category = extractCategory(lines, merchantName.value);

  return {
    amount,
    merchantName,
    category,
    date,
    source: "receipt",
  };
}

/* ---------------------------------- */
/* AMOUNT EXTRACTION                  */
/* ---------------------------------- */

function extractAmount(lines: string[]): ReceiptField<number> {
  const totalKeywords = [
    "TOTAL",
    "GRAND TOTAL",
    "AMOUNT PAYABLE",
    "NET AMOUNT",
    "BALANCE DUE",
  ];

  let bestAmount: number | null = null;
  let hasKeyword = false;
  let hasCurrency = false;

  for (const line of lines) {
    const containsKeyword = totalKeywords.some((k) => line.includes(k));
    const currencyMatch = line.match(/(₹|RS\.?|INR)\s?([\d,.]+)/);

    if (currencyMatch) {
      const value = parseFloat(currencyMatch[2].replace(/,/g, ""));
      if (!isNaN(value)) {
        if (bestAmount === null || value > bestAmount) {
          bestAmount = value;
          hasKeyword = containsKeyword;
          hasCurrency = true;
        }
      }
    }
  }

  const confidence = getAmountConfidence(hasKeyword, hasCurrency);

  return {
    value: confidence === "LOW" ? null : bestAmount,
    confidence,
  };
}

/* ---------------------------------- */
/* MERCHANT EXTRACTION                */
/* ---------------------------------- */

function extractMerchant(lines: string[]): ReceiptField<string> {
  const maxLinesToCheck = Math.min(lines.length, 3);

  for (let i = 0; i < maxLinesToCheck; i++) {
    const line = lines[i];

    const hasDigits = /\d/.test(line);
    const isInvalid =
      line.includes("GST") ||
      line.includes("INVOICE") ||
      line.includes("PHONE") ||
      line.includes("PINCODE");

    if (isInvalid) continue;

    const confidence = getMerchantConfidence(i, hasDigits);

    if (confidence !== "LOW") {
      return {
        value: line,
        confidence,
      };
    }
  }

  return {
    value: null,
    confidence: "LOW",
  };
}

/* ---------------------------------- */
/* DATE EXTRACTION                    */
/* ---------------------------------- */

function extractDate(lines: string[]): ReceiptField<Date> {
  const dateRegex =
    /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|\d{2}\s[A-Z]{3}\s\d{4})/;

  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const parsed = new Date(match[0]);
      const isValid = !isNaN(parsed.getTime());

      return {
        value: isValid ? parsed : null,
        confidence: getDateConfidence(isValid),
      };
    }
  }

  return {
    value: null,
    confidence: "LOW",
  };
}

/* ---------------------------------- */
/* CATEGORY EXTRACTION                */
/* ---------------------------------- */

function extractCategory(
  lines: string[],
  merchantName: string | null
): ReceiptField<ExpenseCategory> {
  const searchableText = [
    merchantName ?? "",
    ...lines,
  ].join(" ").toLowerCase();

  for (const category of Object.keys(
    CATEGORY_KEYWORDS
  ) as ExpenseCategory[]) {
    const keywords = CATEGORY_KEYWORDS[category];

    for (const keyword of keywords) {
      if (searchableText.includes(keyword)) {
        return {
          value: category,
          confidence: getCategoryConfidence(true),
        };
      }
    }
  }

  return {
    value: null,
    confidence: "LOW",
  };
}

import { ConfidenceLevel } from "./receiptTypes";

// Decide confidence for extracted amount
export function getAmountConfidence(
  hasTotalKeyword: boolean,
  hasCurrencySymbol: boolean
): ConfidenceLevel {
  if (hasTotalKeyword && hasCurrencySymbol) return "HIGH";
  if (hasCurrencySymbol) return "MEDIUM";
  return "LOW";
}

// Decide confidence for merchant name
export function getMerchantConfidence(
  lineIndex: number,
  hasDigits: boolean
): ConfidenceLevel {
  if (lineIndex === 0 && !hasDigits) return "HIGH";
  if (lineIndex <= 2 && !hasDigits) return "MEDIUM";
  return "LOW";
}

// Decide confidence for category
export function getCategoryConfidence(
  keywordMatched: boolean
): ConfidenceLevel {
  return keywordMatched ? "HIGH" : "LOW";
}

// Decide confidence for date
export function getDateConfidence(isValidDate: boolean): ConfidenceLevel {
  return isValidDate ? "HIGH" : "LOW";
}

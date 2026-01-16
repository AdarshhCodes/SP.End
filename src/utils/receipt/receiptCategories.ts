
import { ExpenseCategory } from "./receiptTypes";

// Keywords
export const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Food: [
    "zomato",
    "swiggy",
    "restaurant",
    "cafe",
    "pizza",
    "burger",
    "food",
    "bakery",
  ],

  Shopping: [
    "amazon",
    "flipkart",
    "myntra",
    "store",
    "mart",
    "shop",
    "retail",
  ],

  Bills: [
    "electricity",
    "gas",
    "water",
    "broadband",
    "recharge",
    "mobile bill",
    "internet",
  ],

  Travel: [
    "uber",
    "ola",
    "irctc",
    "flight",
    "bus",
    "metro",
    "cab",
    "railway",
  ],

  Other: [],
};

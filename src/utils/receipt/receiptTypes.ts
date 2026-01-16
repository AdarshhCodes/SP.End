
// agar condidence/accuracy jyada h toh hi scan hoga
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ReceiptField<T> {
    value: T | null;
    confidence: ConfidenceLevel;
}

export type ExpenseCategory =
    | "Food"
    | "Shopping"
    | "Bills"
    | "Travel"
    | "Other";

// Where the data came from
export type ReceiptSource = "manual" | "receipt" | "ai";

// Final parsed receipt shape
export interface ParsedReceipt {
    amount: ReceiptField<number>;
    merchantName: ReceiptField<string>;
    category: ReceiptField<ExpenseCategory>;
    date: ReceiptField<Date>;
    source: ReceiptSource;
}

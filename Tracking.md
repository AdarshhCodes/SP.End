# Spending Tracking & Analytics Documentation

This document outlines the data storage architecture and the logic used to calculate financial insights, spend scores, and smart suggestions within the SP.End dashboard.

## 1. Data Storage (Supabase)

All spending data is stored in a **Supabase (PostgreSQL)** database. The core tables involved are:

### `expenses` Table
Stores individual transaction details.
- `id`: Unique identifier (UUID).
- `user_id`: Reference to the authenticated user.
- `item_name`: Description of the expense.
- `amount`: The cost (Numeric).
- `category`: Enum (`Food`, `Shopping`, `Travel`, `Bills`, `Other`).
- `expense_type`: Enum (`need`, `want`) – Crucial for the Smart Spend Score.
- `date`: The date of the transaction.

### `profiles` Table
Stores user-specific configuration.
- `monthly_budget`: The global budget limit used for efficiency calculations.

---

## 2. Calculation Logic

The analytics engine is located in `src/utils/insightEngine.ts`.

### Smart Spend Score (0 - 100)
The Smart Spend Score is a health index of your financial habits. It starts at **100** and applies penalties based on specific behaviors:

| Criteria | Penalty |
| :--- | :--- |
| **Budget Usage** | -30 if > 100%, -20 if > 90%, -10 if > 80% |
| **Wants vs Needs** | -20 if 'Wants' > 60% of total spend, -10 if > 40% |
| **Category Concentration** | -10 for every category that exceeds 40% of total spend |
| **Month-over-Month Growth** | -15 if spending increased by > 30%, -10 if > 20% |

**Formula Snippet:**
```typescript
score = 100 - (BudgetPenalties + WantsPenalties + ConcentrationPenalties + GrowthPenalties)
return Math.max(0, Math.min(100, score));
```

### Budget Efficiency (%)
This metric represents how much of your allocated monthly budget has been utilized.
- **Logic**: `(Total Spent / Monthly Budget) * 100`
- **Visualization**: Shows as a percentage in the "Total Monthly Spending" card. If no budget is set, it defaults to 1.

### Smart Insight Reports (Nudges)
Insights are generated dynamically based on spending patterns to encourage better habits.

1.  **Budget Alerts**: Triggered when budget usage crosses 75% or 90%.
2.  **Category Optimization**: If a category (e.g., *Food*) exceeds 40% of the total budget, a specific suggestion is provided (e.g., "Try meal planning").
3.  **Wants Priority**: Triggered if spending on 'Wants' in a specific category exceeds spending on 'Needs' and is over $100.
4.  **Impulse Detection**: If 3 out of the last 5 transactions are 'Wants' under $50, the system flags impulsive behavior.

---

## 3. Real-time Processing

- **Dashboard Sync**: Every time the dashboard loads, it fetches the current month's expenses and recalculates these metrics on the fly.
- **Persistence**: While scores are calculated in the UI, "Nudges" (insights) are persisted to the `nudges` table in Supabase to ensure history is maintained and duplicates aren't shown repeatedly.

---

*Last Updated: January 2026*

import { Expense } from '../lib/supabase';

export type CategoryStats = {
  category: string;
  total: number;
  percentage: number;
  count: number;
  needsTotal: number;
  wantsTotal: number;
};

export type SpendingTrend = 'high' | 'normal' | 'low';

export function calculateCategoryStats(expenses: Expense[]): CategoryStats[] {
  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Other'];
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return categories.map((category) => {
    const categoryExpenses = expenses.filter((exp) => exp.category === category);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const needsTotal = categoryExpenses
      .filter((exp) => exp.expense_type === 'need')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const wantsTotal = categoryExpenses
      .filter((exp) => exp.expense_type === 'want')
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      category,
      total,
      percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
      count: categoryExpenses.length,
      needsTotal,
      wantsTotal,
    };
  }).sort((a, b) => b.total - a.total);
}

export function calculateSmartSpendScore(
  expenses: Expense[],
  monthlyBudget: number,
  previousMonthExpenses: Expense[]
): number {
  if (expenses.length === 0) return 100;

  let score = 100;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryStats = calculateCategoryStats(expenses);

  if (monthlyBudget > 0) {
    const budgetUsage = (totalSpent / monthlyBudget) * 100;
    if (budgetUsage > 100) score -= 30;
    else if (budgetUsage > 90) score -= 20;
    else if (budgetUsage > 80) score -= 10;
  }

  const needsTotal = expenses
    .filter((exp) => exp.expense_type === 'need')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const wantsTotal = expenses
    .filter((exp) => exp.expense_type === 'want')
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (totalSpent > 0) {
    const wantsPercentage = (wantsTotal / totalSpent) * 100;
    if (wantsPercentage > 60) score -= 20;
    else if (wantsPercentage > 40) score -= 10;
  }

  const highSpendingCategories = categoryStats.filter((cat) => cat.percentage > 40);
  score -= highSpendingCategories.length * 10;

  if (previousMonthExpenses.length > 0) {
    const previousTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const increase = ((totalSpent - previousTotal) / previousTotal) * 100;
    if (increase > 30) score -= 15;
    else if (increase > 20) score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

export function generateSmartNudges(
  expenses: Expense[],
  monthlyBudget: number,
  categoryStats: CategoryStats[]
): string[] {
  const nudges: string[] = [];
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (monthlyBudget > 0) {
    const budgetUsage = (totalSpent / monthlyBudget) * 100;
    if (budgetUsage > 90) {
      nudges.push(
        `You've used ${budgetUsage.toFixed(0)}% of your monthly budget. Consider cutting back on non-essentials.`
      );
    } else if (budgetUsage > 75) {
      nudges.push(
        `You're at ${budgetUsage.toFixed(0)}% of your budget. Great job staying mindful!`
      );
    }
  }

  categoryStats.forEach((cat) => {
    if (cat.percentage > 40 && cat.total > 0) {
      if (cat.category === 'Food') {
        nudges.push(
          `Your food spending is ${cat.percentage.toFixed(0)}% of total expenses. Try meal planning to reduce dining out costs.`
        );
      } else if (cat.category === 'Shopping') {
        nudges.push(
          `Shopping is taking up ${cat.percentage.toFixed(0)}% of your budget. Consider the 24-hour rule before purchasing.`
        );
      } else {
        nudges.push(
          `${cat.category} spending is high at ${cat.percentage.toFixed(0)}%. Look for ways to optimize these expenses.`
        );
      }
    }

    if (cat.wantsTotal > cat.needsTotal && cat.wantsTotal > 100) {
      nudges.push(
        `In ${cat.category}, you're spending more on wants ($${cat.wantsTotal.toFixed(0)}) than needs. Try redirecting some to savings.`
      );
    }
  });

  const wantsTotal = expenses
    .filter((exp) => exp.expense_type === 'want')
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (wantsTotal > totalSpent * 0.5 && totalSpent > 0) {
    nudges.push(
      `Over 50% of your spending is on wants. Small changes can lead to big savings!`
    );
  }

  if (nudges.length === 0) {
    nudges.push(
      'Great spending habits! Keep tracking your expenses to maintain financial awareness.'
    );
  }

  return nudges.slice(0, 4);
}

export function detectImpulsiveSpending(expenses: Expense[]): boolean {
  const recentExpenses = expenses.slice(0, 5);
  const smallWants = recentExpenses.filter(
    (exp) => exp.expense_type === 'want' && exp.amount < 50
  );

  return smallWants.length >= 3;
}

export function checkBadgeEligibility(
  expenses: Expense[],
  monthlyBudget: number,
  currentBadges: string[]
): { type: string; name: string; description: string }[] {
  const newBadges: { type: string; name: string; description: string }[] = [];
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (
    monthlyBudget > 0 &&
    totalSpent <= monthlyBudget &&
    !currentBadges.includes('budget_keeper')
  ) {
    newBadges.push({
      type: 'budget_keeper',
      name: 'Budget Keeper',
      description: 'Stayed within monthly budget',
    });
  }

  const needsTotal = expenses
    .filter((exp) => exp.expense_type === 'need')
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (needsTotal > totalSpent * 0.6 && !currentBadges.includes('smart_spender')) {
    newBadges.push({
      type: 'smart_spender',
      name: 'Smart Spender',
      description: 'Prioritized needs over wants',
    });
  }

  if (expenses.length >= 20 && !currentBadges.includes('tracking_champion')) {
    newBadges.push({
      type: 'tracking_champion',
      name: 'Tracking Champion',
      description: 'Logged 20+ expenses',
    });
  }

  return newBadges;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: 'from-orange-400 to-red-500',
    Shopping: 'from-pink-400 to-purple-500',
    Travel: 'from-blue-400 to-cyan-500',
    Bills: 'from-yellow-400 to-orange-500',
    Other: 'from-gray-400 to-gray-600',
  };
  return colors[category] || 'from-gray-400 to-gray-600';
}

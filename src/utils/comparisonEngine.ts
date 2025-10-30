import { Expense } from '../lib/supabase';

export type PeriodComparison = {
  currentPeriod: {
    start: string;
    end: string;
    total: number;
    categoryBreakdown: Record<string, number>;
  };
  previousPeriod: {
    start: string;
    end: string;
    total: number;
    categoryBreakdown: Record<string, number>;
  };
  changes: {
    totalChange: number;
    totalChangePercent: number;
    categoryChanges: Record<string, { amount: number; percent: number }>;
  };
  improvement: boolean;
};

export function getWeekDates(weeksAgo: number = 0): { start: Date; end: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - diff - (weeksAgo * 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

export function getMonthDates(monthsAgo: number = 0): { start: Date; end: Date } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() - monthsAgo;

  const start = new Date(year, month, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function calculatePeriodBreakdown(expenses: Expense[]): {
  total: number;
  categoryBreakdown: Record<string, number>;
} {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryBreakdown: Record<string, number> = {};

  expenses.forEach((exp) => {
    if (!categoryBreakdown[exp.category]) {
      categoryBreakdown[exp.category] = 0;
    }
    categoryBreakdown[exp.category] += exp.amount;
  });

  return { total, categoryBreakdown };
}

export function compareWeeklySpending(
  currentWeekExpenses: Expense[],
  previousWeekExpenses: Expense[]
): PeriodComparison {
  const currentWeek = getWeekDates(0);
  const previousWeek = getWeekDates(1);

  const currentData = calculatePeriodBreakdown(currentWeekExpenses);
  const previousData = calculatePeriodBreakdown(previousWeekExpenses);

  const totalChange = currentData.total - previousData.total;
  const totalChangePercent =
    previousData.total > 0 ? (totalChange / previousData.total) * 100 : 0;

  const categoryChanges: Record<string, { amount: number; percent: number }> = {};
  const allCategories = new Set([
    ...Object.keys(currentData.categoryBreakdown),
    ...Object.keys(previousData.categoryBreakdown),
  ]);

  allCategories.forEach((category) => {
    const current = currentData.categoryBreakdown[category] || 0;
    const previous = previousData.categoryBreakdown[category] || 0;
    const change = current - previous;
    const percent = previous > 0 ? (change / previous) * 100 : 0;
    categoryChanges[category] = { amount: change, percent };
  });

  return {
    currentPeriod: {
      start: currentWeek.start.toISOString().split('T')[0],
      end: currentWeek.end.toISOString().split('T')[0],
      total: currentData.total,
      categoryBreakdown: currentData.categoryBreakdown,
    },
    previousPeriod: {
      start: previousWeek.start.toISOString().split('T')[0],
      end: previousWeek.end.toISOString().split('T')[0],
      total: previousData.total,
      categoryBreakdown: previousData.categoryBreakdown,
    },
    changes: {
      totalChange,
      totalChangePercent,
      categoryChanges,
    },
    improvement: totalChange <= 0,
  };
}

export function compareMonthlySpending(
  currentMonthExpenses: Expense[],
  previousMonthExpenses: Expense[]
): PeriodComparison {
  const currentMonth = getMonthDates(0);
  const previousMonth = getMonthDates(1);

  const currentData = calculatePeriodBreakdown(currentMonthExpenses);
  const previousData = calculatePeriodBreakdown(previousMonthExpenses);

  const totalChange = currentData.total - previousData.total;
  const totalChangePercent =
    previousData.total > 0 ? (totalChange / previousData.total) * 100 : 0;

  const categoryChanges: Record<string, { amount: number; percent: number }> = {};
  const allCategories = new Set([
    ...Object.keys(currentData.categoryBreakdown),
    ...Object.keys(previousData.categoryBreakdown),
  ]);

  allCategories.forEach((category) => {
    const current = currentData.categoryBreakdown[category] || 0;
    const previous = previousData.categoryBreakdown[category] || 0;
    const change = current - previous;
    const percent = previous > 0 ? (change / previous) * 100 : 0;
    categoryChanges[category] = { amount: change, percent };
  });

  return {
    currentPeriod: {
      start: currentMonth.start.toISOString().split('T')[0],
      end: currentMonth.end.toISOString().split('T')[0],
      total: currentData.total,
      categoryBreakdown: currentData.categoryBreakdown,
    },
    previousPeriod: {
      start: previousMonth.start.toISOString().split('T')[0],
      end: previousMonth.end.toISOString().split('T')[0],
      total: previousData.total,
      categoryBreakdown: previousData.categoryBreakdown,
    },
    changes: {
      totalChange,
      totalChangePercent,
      categoryChanges,
    },
    improvement: totalChange <= 0,
  };
}

export function checkTimeBasedBadges(
  weeklyComparison: PeriodComparison,
  monthlyComparison: PeriodComparison,
  currentBadges: string[]
): { type: string; name: string; description: string }[] {
  const newBadges: { type: string; name: string; description: string }[] = [];

  if (
    weeklyComparison.improvement &&
    weeklyComparison.previousPeriod.total > 0 &&
    !currentBadges.includes('saver_of_week')
  ) {
    newBadges.push({
      type: 'saver_of_week',
      name: 'Saver of the Week',
      description: 'Reduced spending compared to last week',
    });
  }

  if (
    monthlyComparison.improvement &&
    monthlyComparison.previousPeriod.total > 0 &&
    !currentBadges.includes('saver_of_month')
  ) {
    newBadges.push({
      type: 'saver_of_month',
      name: 'Saver of the Month',
      description: 'Reduced spending compared to last month',
    });
  }

  const weeklyReduction = Math.abs(weeklyComparison.changes.totalChangePercent);
  if (
    weeklyComparison.improvement &&
    weeklyReduction >= 20 &&
    !currentBadges.includes('super_saver_week')
  ) {
    newBadges.push({
      type: 'super_saver_week',
      name: 'Super Saver (Week)',
      description: `Reduced spending by ${weeklyReduction.toFixed(0)}% this week`,
    });
  }

  const monthlyReduction = Math.abs(monthlyComparison.changes.totalChangePercent);
  if (
    monthlyComparison.improvement &&
    monthlyReduction >= 20 &&
    !currentBadges.includes('super_saver_month')
  ) {
    newBadges.push({
      type: 'super_saver_month',
      name: 'Super Saver (Month)',
      description: `Reduced spending by ${monthlyReduction.toFixed(0)}% this month`,
    });
  }

  return newBadges;
}

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Expense, Badge } from '../lib/supabase';
import {
  compareWeeklySpending,
  compareMonthlySpending,
  getWeekDates,
  getMonthDates,
  checkTimeBasedBadges,
  PeriodComparison,
} from '../utils/comparisonEngine';
import { getCategoryColor } from '../utils/insightEngine';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowRight,
  Award,
  Sparkles,
} from 'lucide-react';

export default function Insights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyComparison, setWeeklyComparison] = useState<PeriodComparison | null>(null);
  const [monthlyComparison, setMonthlyComparison] = useState<PeriodComparison | null>(null);
  const [newBadges, setNewBadges] = useState<
    { type: string; name: string; description: string }[]
  >([]);

  useEffect(() => {
    if (user) {
      fetchComparisonData();
    }
  }, [user]);

  const fetchComparisonData = async () => {
    if (!user) return;

    try {
      const currentWeek = getWeekDates(0);
      const previousWeek = getWeekDates(1);
      const currentMonth = getMonthDates(0);
      const previousMonth = getMonthDates(1);

      const { data: currentWeekExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', currentWeek.start.toISOString().split('T')[0])
        .lte('date', currentWeek.end.toISOString().split('T')[0]);

      const { data: previousWeekExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', previousWeek.start.toISOString().split('T')[0])
        .lte('date', previousWeek.end.toISOString().split('T')[0]);

      const { data: currentMonthExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', currentMonth.start.toISOString().split('T')[0])
        .lte('date', currentMonth.end.toISOString().split('T')[0]);

      const { data: previousMonthExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', previousMonth.start.toISOString().split('T')[0])
        .lte('date', previousMonth.end.toISOString().split('T')[0]);

      const weeklyComp = compareWeeklySpending(
        (currentWeekExpenses as Expense[]) || [],
        (previousWeekExpenses as Expense[]) || []
      );

      const monthlyComp = compareMonthlySpending(
        (currentMonthExpenses as Expense[]) || [],
        (previousMonthExpenses as Expense[]) || []
      );

      setWeeklyComparison(weeklyComp);
      setMonthlyComparison(monthlyComp);

      await supabase.from('spending_comparisons').upsert([
        {
          user_id: user.id,
          period_type: 'week',
          period_start: weeklyComp.currentPeriod.start,
          period_end: weeklyComp.currentPeriod.end,
          total_spent: weeklyComp.currentPeriod.total,
          category_breakdown: weeklyComp.currentPeriod.categoryBreakdown,
        },
        {
          user_id: user.id,
          period_type: 'month',
          period_start: monthlyComp.currentPeriod.start,
          period_end: monthlyComp.currentPeriod.end,
          total_spent: monthlyComp.currentPeriod.total,
          category_breakdown: monthlyComp.currentPeriod.categoryBreakdown,
        },
      ]);

      const { data: existingBadges } = await supabase
        .from('badges')
        .select('badge_type')
        .eq('user_id', user.id);

      const existingBadgeTypes = existingBadges?.map((b) => b.badge_type) || [];
      const earnedBadges = checkTimeBasedBadges(weeklyComp, monthlyComp, existingBadgeTypes);

      if (earnedBadges.length > 0) {
        await supabase.from('badges').insert(
          earnedBadges.map((badge) => ({
            user_id: user.id,
            badge_name: badge.name,
            badge_type: badge.type,
          }))
        );
        setNewBadges(earnedBadges);
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderComparisonCard = (
    title: string,
    comparison: PeriodComparison | null,
    icon: React.ReactNode
  ) => {
    if (!comparison) return null;

    const isImproving = comparison.improvement;
    const changeColor = isImproving ? 'text-green-600' : 'text-red-600';
    const bgColor = isImproving ? 'bg-green-50' : 'bg-red-50';

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          {icon}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`${bgColor} rounded-xl p-4`}>
            <p className="text-sm text-gray-600 mb-1">Previous Period</p>
            <p className="text-2xl font-bold text-gray-800">
              ${comparison.previousPeriod.total.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(comparison.previousPeriod.start).toLocaleDateString()} -{' '}
              {new Date(comparison.previousPeriod.end).toLocaleDateString()}
            </p>
          </div>

          <div className={`${bgColor} rounded-xl p-4`}>
            <p className="text-sm text-gray-600 mb-1">Current Period</p>
            <p className="text-2xl font-bold text-gray-800">
              ${comparison.currentPeriod.total.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(comparison.currentPeriod.start).toLocaleDateString()} -{' '}
              {new Date(comparison.currentPeriod.end).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className={`${bgColor} rounded-xl p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Change</span>
            <div className="flex items-center space-x-2">
              {isImproving ? (
                <TrendingDown className={`w-5 h-5 ${changeColor}`} />
              ) : (
                <TrendingUp className={`w-5 h-5 ${changeColor}`} />
              )}
              <span className={`text-lg font-bold ${changeColor}`}>
                ${Math.abs(comparison.changes.totalChange).toFixed(2)}
              </span>
              <span className={`text-sm font-medium ${changeColor}`}>
                ({Math.abs(comparison.changes.totalChangePercent).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {isImproving && comparison.previousPeriod.total > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-6 border border-green-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">
                Great job! You're spending less than last period!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Category Breakdown</h3>
          {Object.entries(comparison.changes.categoryChanges).map(([category, change]) => {
            const isPositive = change.amount <= 0;
            const color = isPositive ? 'text-green-600' : 'text-red-600';

            return (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(
                      category
                    )} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">
                      {category.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium text-gray-700">{category}</span>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${color}`}>
                    {change.amount >= 0 ? '+' : ''}${change.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs ${color}`}>
                    {change.percent >= 0 ? '+' : ''}
                    {change.percent.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Spending Insights</h1>
        <p className="text-gray-500 mt-1">Compare your spending patterns over time</p>
      </div>

      {newBadges.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-8 h-8" />
            <h2 className="text-2xl font-bold">New Badges Earned!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newBadges.map((badge) => (
              <div
                key={badge.type}
                className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm"
              >
                <p className="font-bold text-lg">{badge.name}</p>
                <p className="text-yellow-100 text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {renderComparisonCard(
          'Weekly Comparison',
          weeklyComparison,
          <Calendar className="w-6 h-6 text-teal-600" />
        )}

        {renderComparisonCard(
          'Monthly Comparison',
          monthlyComparison,
          <Calendar className="w-6 h-6 text-blue-600" />
        )}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
          <Award className="w-5 h-5 text-teal-600" />
          <span>How to Earn More Badges</span>
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <ArrowRight className="w-4 h-4 text-teal-600" />
            <span>Spend less than previous week to earn "Saver of the Week"</span>
          </li>
          <li className="flex items-center space-x-2">
            <ArrowRight className="w-4 h-4 text-teal-600" />
            <span>Spend less than previous month to earn "Saver of the Month"</span>
          </li>
          <li className="flex items-center space-x-2">
            <ArrowRight className="w-4 h-4 text-teal-600" />
            <span>Reduce spending by 20% or more to earn "Super Saver" badges</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

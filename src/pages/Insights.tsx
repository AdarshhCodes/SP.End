import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Expense } from '../lib/supabase';
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
    const changeColor = isImproving ? 'text-emerald-400' : 'text-rose-400';

    return (
      <div className="glass-card rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative group">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors">
            <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Previous Period</p>
            <p className="text-3xl font-black dark:text-white text-slate-900 transition-colors">
              ${comparison.previousPeriod.total.toFixed(2)}
            </p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-gray-600 mt-3 flex items-center gap-2 transition-colors">
              <Calendar className="w-3 h-3" />
              {new Date(comparison.previousPeriod.start).toLocaleDateString()} - {new Date(comparison.previousPeriod.end).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 rounded-2xl p-6 border relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
            <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Current Period</p>
            <p className="text-3xl font-black dark:text-white text-slate-900 transition-colors">
              ${comparison.currentPeriod.total.toFixed(2)}
            </p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-gray-600 mt-3 flex items-center gap-2 transition-colors">
              <Calendar className="w-3 h-3" />
              {new Date(comparison.currentPeriod.start).toLocaleDateString()} - {new Date(comparison.currentPeriod.end).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#051410] border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-8 shadow-inner transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest transition-colors">Aggregate Variance</span>
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${isImproving ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {isImproving ? (
                  <TrendingDown className={`w-6 h-6 ${changeColor}`} />
                ) : (
                  <TrendingUp className={`w-6 h-6 ${changeColor}`} />
                )}
              </div>
              <div>
                <span className={`text-2xl font-black ${changeColor}`}>
                  {comparison.changes.totalChange >= 0 ? '+' : '-'}${Math.abs(comparison.changes.totalChange).toFixed(2)}
                </span>
                <span className={`ml-3 text-sm font-bold ${changeColor} opacity-80 uppercase tracking-widest`}>
                  ({Math.abs(comparison.changes.totalChangePercent).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {isImproving && comparison.previousPeriod.total > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-8 animate-pulse">
            <div className="flex items-center space-x-3 text-emerald-400">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-black uppercase tracking-widest">
                Elite Savings Detected: You are currently outperforming your last period!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-4 ml-2 transition-colors">Category Dynamics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(comparison.changes.categoryChanges).map(([category, change]) => {
              const isPositiveChange = change.amount <= 0;
              const color = isPositiveChange ? 'text-emerald-400' : 'text-rose-400';

              return (
                <div key={category} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[24px] hover:bg-emerald-50 dark:hover:bg-white/10 transition-colors group/item">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(
                        category
                      )} flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform`}
                    >
                      <span className="text-white font-black text-xs uppercase">
                        {category.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-bold dark:text-white text-slate-900 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors uppercase tracking-tight">{category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${color}`}>
                      {change.amount >= 0 ? '+' : '-'}${Math.abs(change.amount).toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-bold ${color} opacity-70 tracking-widest`}>
                      {change.percent >= 0 ? '+' : '-'}{Math.abs(change.percent).toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter transition-colors">SPENDING INSIGHTS</h1>
        <p className="text-slate-500 dark:text-gray-500 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] transition-colors">Comparative analytical dashboard</p>
      </div>

      {newBadges.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] shadow-2xl p-10 mb-10 text-black relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/20 blur-[100px] rounded-full" />
          <div className="flex items-center space-x-5 mb-8 relative z-10">
            <div className="p-4 bg-black rounded-2xl shadow-xl">
              <Award className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Achievements Unlocked!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {newBadges.map((badge) => (
              <div
                key={badge.type}
                className="bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-[1.02] transition-transform"
              >
                <p className="font-black text-xl uppercase tracking-tight">{badge.name}</p>
                <p className="text-black/70 text-sm font-bold mt-2 uppercase tracking-wide leading-tight">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {renderComparisonCard(
          'Weekly Comparison',
          weeklyComparison,
          <Calendar className="w-6 h-6 text-emerald-400" />
        )}

        {renderComparisonCard(
          'Monthly Comparison',
          monthlyComparison,
          <Calendar className="w-6 h-6 text-emerald-400" />
        )}
      </div>

      <div className="mt-10 glass-card rounded-[32px] p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden transition-all duration-500">
        <div className="relative z-10">
          <h3 className="text-xl font-black dark:text-white text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tighter italic transition-colors">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <span>Achievement Protocols</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-widest italic transition-colors">Saver of the Week</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 font-medium leading-relaxed uppercase tracking-wider pl-7 transition-colors">
                Optimize your current week expenditure to be lower than the previous iteration's baseline.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-widest italic transition-colors">Saver of the Month</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 font-medium leading-relaxed uppercase tracking-wider pl-7 transition-colors">
                Maintain aggressive budget control across the 30-day operating cycle relative to previous performance.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-widest italic transition-colors">Super Saver Tier</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 font-medium leading-relaxed uppercase tracking-wider pl-7 transition-colors">
                Execute extreme efficiency by reducing net expenditure by 20% or more across any reporting period.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}

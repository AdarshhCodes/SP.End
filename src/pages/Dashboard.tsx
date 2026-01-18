import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Expense, Nudge, Badge, Goal } from '../lib/supabase';
import {
  calculateCategoryStats,
  calculateSmartSpendScore,
  generateSmartNudges,
  getCategoryColor,
} from '../utils/insightEngine';
import {
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  MoreHorizontal,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import SpendingChart from '../components/SpendingChart';
import NativeFeatures from '../components/NativeFeatures';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [smartSpendScore, setSmartSpendScore] = useState(0);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      const { data: nudgesData, error: nudgesError } = await supabase
        .from('nudges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (nudgesError) throw nudgesError;

      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;

      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      setExpenses(expensesData || []);
      setNudges(nudgesData || []);
      setBadges(badgesData || []);
      setGoals(goalsData || []);

      const score = calculateSmartSpendScore(
        expensesData || [],
        profile?.monthly_budget || 0,
        []
      );
      setSmartSpendScore(score);

      const categoryStats = calculateCategoryStats(expensesData || []);
      const generatedNudges = generateSmartNudges(
        expensesData || [],
        profile?.monthly_budget || 0,
        categoryStats
      );

      for (const message of generatedNudges) {
        const exists = nudgesData?.some((n) => n.message === message);
        if (!exists) {
          await supabase.from('nudges').insert([
            {
              user_id: user.id,
              message,
              category: null,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendData = timeRange === 'month'
    ? [
      { name: 'Week 1', expenditure: 240, score: 85 },
      { name: 'Week 2', expenditure: 180, score: 88 },
      { name: 'Week 3', expenditure: 320, score: 82 },
      { name: 'Week 4', expenditure: 210, score: 91 },
      { name: 'Week 5', expenditure: 450, score: 75 },
      { name: 'Week 6', expenditure: 300, score: 80 },
      { name: 'Week 7', expenditure: 280, score: 84 },
      { name: 'Week 8', expenditure: 200, score: 92 },
    ]
    : [
      { name: 'Mon', expenditure: 45, score: 90 },
      { name: 'Tue', expenditure: 32, score: 92 },
      { name: 'Wed', expenditure: 85, score: 85 },
      { name: 'Thu', expenditure: 20, score: 95 },
      { name: 'Fri', expenditure: 120, score: 78 },
      { name: 'Sat', expenditure: 65, score: 88 },
      { name: 'Sun', expenditure: 38, score: 91 },
    ];

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryStats = calculateCategoryStats(expenses);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dashboard-bg">
        <div className="animate-pulse text-xl font-bold text-teal-600">Loading your insight...</div>
      </div>
    );
  }

  return (
    <div className="relative z-10 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 transition-colors">Welcome, {profile?.name || 'User'}</h1>
          <p className="dark:text-gray-400 text-slate-500 text-sm transition-colors">Your personal budget overview</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Profile Card */}
        <div className="glass-card rounded-[32px] p-8 flex flex-col items-center">
          <div className="flex justify-end w-full">
            <button className="text-gray-600 hover:text-gray-400 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 p-1">
              <img
                src={`https://ui-avatars.com/api/?name=${profile?.name}&background=random`}
                className="w-full h-full rounded-full object-cover"
                alt="Profile"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#1a231e]">
              <Award className="w-3 h-3 text-black font-bold" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-1 dark:text-white text-slate-900">{profile?.name || 'Crystal'}</h3>
          <p className="text-emerald-500/80 text-xs font-semibold uppercase tracking-wider mb-6">Smart Spender</p>
          <div className="flex items-center gap-8 border-t border-slate-200 dark:border-white/5 pt-6 w-full justify-center">
            <div className="text-center">
              <p className="text-lg font-bold dark:text-white text-slate-900">{badges.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">Badges</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold dark:text-white text-slate-900">{goals.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">Goals</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold dark:text-white text-slate-900">{nudges.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">Nudges</p>
            </div>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className={`${totalSpent > (profile?.monthly_budget || 0) ? 'gradient-card-red' : 'gradient-card-green'} rounded-[32px] p-8 relative overflow-hidden group shadow-2xl`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <p className="font-semibold text-lg opacity-90">Total Monthly Spending</p>
              <div className="w-8 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1 mb-8">
              <p className="text-4xl font-extrabold">${totalSpent.toFixed(2)}</p>
              <p className="text-sm opacity-80 font-medium">Avg. Daily: ${(totalSpent / 30).toFixed(2)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">Budget Utilization</p>
                <p className="text-lg font-bold">{((totalSpent / (profile?.monthly_budget || 1)) * 100).toFixed(0)}%</p>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm" />
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm" />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </div>

        {/* Smart Score Card */}
        <div className="gradient-card-dark rounded-[32px] p-8 relative overflow-hidden group shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <p className="font-semibold text-lg opacity-90 text-emerald-400">Smart Spend Score</p>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-emerald-500/20">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-1 mb-8">
              <p className={`text-4xl font-extrabold ${smartSpendScore < 60 ? 'text-red-400' : 'text-white'}`}>{smartSpendScore}%</p>
              <p className="text-sm dark:opacity-60 opacity-80 font-medium">Financial Health Index</p>
            </div>
            <div className="bg-slate-200/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-white/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500">Score Status</p>
                <p className={`text-lg font-bold ${smartSpendScore < 60 ? 'text-red-400' : 'text-emerald-500'}`}>
                  {smartSpendScore < 40 ? 'Critical' : smartSpendScore < 70 ? 'Needs Attention' : 'Healthy'}
                </p>
              </div>
              <TrendingUp className={`w-6 h-6 ${smartSpendScore < 60 ? 'text-red-400' : 'text-emerald-500'}`} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-y-12 -translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </div>

        {/* Recent Activity Card */}
        <div className="glass-card rounded-[32px] p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg dark:text-white text-slate-900">Recent Expenses</h3>
          </div>
          <div className="space-y-6 flex-1">
            {expenses.slice(0, 2).map((expense) => (
              <div key={expense.id} className="flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getCategoryColor(expense.category)} flex items-center justify-center shrink-0 shadow-lg`}>
                  <span className="text-white text-xs font-bold">{expense.category[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate dark:text-white text-slate-900 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{expense.item_name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">{expense.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm dark:text-white text-slate-900">${expense.amount}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-4">No recent expenses logged.</p>
            )}
          </div>
          <button
            onClick={() => onNavigate?.('history')}
            className="w-full mt-6 py-3 text-[10px] font-bold text-emerald-500/80 hover:text-emerald-400 transition-colors uppercase tracking-widest border border-emerald-500/20 rounded-xl hover:bg-emerald-500/5"
          >
            See all transactions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-9">

          {/* Chart Section */}
          <div className="glass-card rounded-[32px] p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div>
                <h2 className="text-xl font-bold dark:text-white text-slate-900">Spending Trends</h2>
                <p className="dark:text-gray-500 text-slate-500 text-sm">Real-time expenditure analytics</p>
              </div>
              <div className="flex bg-slate-200/50 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 text-xs font-bold transition-all duration-300 ${timeRange === 'week'
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-lg text-black'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 text-xs font-bold transition-all duration-300 ${timeRange === 'month'
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-lg text-black'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[350px]">
              <SpendingChart data={trendData} />
            </div>
          </div>
          <NativeFeatures />
        </div>

        {/* Sidebar Area */}
        <div className="xl:col-span-3 flex flex-col gap-8">
          {/* Category Progress */}
          <div className="glass-card rounded-[32px] p-6">
            <h3 className="font-bold text-lg mb-6 dark:text-white text-slate-900">Expense Breakdown</h3>
            <div className="space-y-6">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold dark:text-white text-slate-900">{stat.category}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${stat.percentage > 40 ? 'text-red-400 font-bold' : 'text-slate-500 dark:text-gray-500'}`}>{stat.percentage.toFixed(0)}%</span>
                      <ArrowUpRight className={`w-3 h-3 ${stat.percentage > 40 ? 'text-red-400' : 'text-emerald-500'}`} />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getCategoryColor(stat.category)} rounded-full`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Nudge */}
          <div className="flex-1 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-[#062d24] dark:to-[#041a16] rounded-[32px] p-8 relative overflow-hidden border border-emerald-200 dark:border-emerald-500/10 shadow-2xl transition-all duration-500 flex flex-col justify-center">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-emerald-200 dark:border-emerald-500/20">
                <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold mb-3 text-xl dark:text-white text-emerald-900">Smart Insight</h3>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-100/70 leading-relaxed mb-6 font-medium">
                {nudges[0]?.message || "Looks like you're on track! Keep up the smart spending habits."}
              </p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors underline underline-offset-8 decoration-emerald-500/30">
                Read full report
              </button>
            </div>
            {/* Ambient Glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}


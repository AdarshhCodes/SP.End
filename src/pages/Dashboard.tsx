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
  Search,
  ChevronDown,
  MoreHorizontal,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import SpendingChart from '../components/SpendingChart';

export default function Dashboard() {
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
    <div className="dashboard-bg p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {profile?.name || 'User'}</h1>
            <p className="text-gray-400 text-sm">Your personal budget overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-white/50 backdrop-blur-sm border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-9 space-y-8">
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="glass-card rounded-[32px] p-8 flex flex-col items-center">
                <div className="flex justify-end w-full">
                  <button className="text-gray-300 hover:text-gray-500 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-red-400 p-1">
                    <img
                      src={`https://ui-avatars.com/api/?name=${profile?.name}&background=random`}
                      className="w-full h-full rounded-full object-cover"
                      alt="Profile"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center border-2 border-white">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{profile?.name || 'Crystal'}</h3>
                <p className="text-gray-400 text-xs mb-6">Smart Spender</p>
                <div className="flex items-center gap-8 border-t border-gray-50 pt-6 w-full justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold">{badges.length}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Badges</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{goals.length}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{nudges.length}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Nudges</p>
                  </div>
                </div>
              </div>

              {/* Total Spent Card */}
              <div className="gradient-card-pink rounded-[32px] p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <p className="font-semibold text-lg opacity-90">Total Monthly Spending</p>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1 mb-8">
                    <p className="text-4xl font-extrabold">${totalSpent.toFixed(2)}</p>
                    <p className="text-sm opacity-80">Avg. Daily: ${(totalSpent / 30).toFixed(2)}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-90">Budget Efficiency</p>
                      <p className="text-lg font-bold">{((totalSpent / (profile?.monthly_budget || 1)) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex -space-x-2">
                      {/* Avatats/Icons placeholder */}
                      <div className="w-8 h-8 rounded-full bg-white/30 border border-white/50" />
                      <div className="w-8 h-8 rounded-full bg-white/30 border border-white/50" />
                      <div className="w-8 h-8 rounded-full bg-white/30 border border-white/50" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>

              {/* Smart Score Card */}
              <div className="gradient-card-blue rounded-[32px] p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <p className="font-semibold text-lg opacity-90">Smart Spend Score</p>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1 mb-8">
                    <p className="text-4xl font-extrabold">{smartSpendScore}%</p>
                    <p className="text-sm opacity-80">Financial Health Index</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-90">Score Status</p>
                      <p className="text-lg font-bold">Stable Trend</p>
                    </div>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-12 -translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </div>

            {/* Chart Section */}
            <div className="glass-card rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold">Spending Trends</h2>
                  <p className="text-gray-400 text-sm">Real-time expenditure analytics</p>
                </div>
                <div className="flex bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`px-4 py-2 text-xs font-bold transition-all duration-300 ${timeRange === 'week'
                        ? 'bg-white shadow-sm rounded-lg text-gray-800'
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`px-4 py-2 text-xs font-bold transition-all duration-300 ${timeRange === 'month'
                        ? 'bg-white shadow-sm rounded-lg text-gray-800'
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    Month
                  </button>
                </div>
              </div>
              <SpendingChart data={trendData} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Recent Activity */}
            <div className="glass-card rounded-[32px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Recent Expenses</h3>
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6">
                {expenses.slice(0, 4).map((expense) => (
                  <div key={expense.id} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getCategoryColor(expense.category)} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-xs font-bold">{expense.category[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{expense.item_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${expense.amount}</p>
                      <p className="text-[10px] text-gray-400">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-4">No recent expenses logged.</p>
                )}
              </div>
              <button className="w-full mt-6 py-3 text-xs font-bold text-gray-400 hover:text-teal-500 transition-colors uppercase tracking-widest">See all transactions</button>
            </div>

            {/* Category Progress */}
            <div className="glass-card rounded-[32px] p-6">
              <h3 className="font-bold text-lg mb-6">Expense Breakdown</h3>
              <div className="space-y-6">
                {categoryStats.map((stat) => (
                  <div key={stat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{stat.category}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{stat.percentage.toFixed(0)}%</span>
                        <ArrowUpRight className="w-3 h-3 text-teal-500" />
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
            <div className="bg-teal-900 rounded-[32px] p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                  <Lightbulb className="w-6 h-6 text-yellow-300" />
                </div>
                <h3 className="font-bold mb-2 text-lg">Smart Insight</h3>
                <p className="text-xs text-teal-100 leading-relaxed mb-4">
                  {nudges[0]?.message || "Looks like you're on track! Keep up the smart spending habits."}
                </p>
                <button className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors underline underline-offset-4">
                  Read full report
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 rounded-full -translate-y-12 translate-x-12 blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


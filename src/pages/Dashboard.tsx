import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Expense, Nudge, Badge } from '../lib/supabase';
import {
  calculateCategoryStats,
  calculateSmartSpendScore,
  generateSmartNudges,
  getCategoryColor,
} from '../utils/insightEngine';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Lightbulb,
  Award,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [smartSpendScore, setSmartSpendScore] = useState(0);

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

      setExpenses(expensesData || []);
      setNudges(nudgesData || []);
      setBadges(badgesData || []);

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

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = (profile?.monthly_budget || 0) - totalSpent;
  const categoryStats = calculateCategoryStats(expenses);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {profile?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-gray-500 text-sm">Total Spent</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            ${totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            {remaining >= 0 ? (
              <TrendingDown className="w-5 h-5 text-teal-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-gray-500 text-sm">Remaining Budget</p>
          <p
            className={`text-3xl font-bold mt-1 ${
              remaining >= 0 ? 'text-gray-800' : 'text-red-600'
            }`}
          >
            ${Math.abs(remaining).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Smart Spend Score</p>
          <div className="flex items-baseline mt-1">
            <p className={`text-3xl font-bold ${getScoreColor(smartSpendScore)}`}>
              {smartSpendScore}
            </p>
            <span className="text-sm text-gray-500 ml-2">/ 100</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{getScoreLabel(smartSpendScore)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Badges Earned</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{badges.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Category Breakdown
          </h2>
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {cat.category}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    ${cat.total.toFixed(2)} ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getCategoryColor(
                      cat.category
                    )} transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                {cat.needsTotal > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Needs: ${cat.needsTotal.toFixed(2)} | Wants: $
                    {cat.wantsTotal.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">Smart Suggestions</h2>
          </div>
          <div className="space-y-3">
            {nudges.slice(0, 4).map((nudge) => (
              <div
                key={nudge.id}
                className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100"
              >
                <p className="text-sm text-gray-700">{nudge.message}</p>
              </div>
            ))}
            {nudges.length === 0 && (
              <p className="text-gray-500 text-sm">
                Start tracking expenses to receive personalized suggestions!
              </p>
            )}
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h2>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(
                      expense.category
                    )} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">
                      {expense.category.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.item_name}</p>
                    <p className="text-sm text-gray-500">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">${expense.amount.toFixed(2)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      expense.expense_type === 'need'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {expense.expense_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

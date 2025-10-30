import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Badge, Expense } from '../lib/supabase';
import { checkBadgeEligibility } from '../utils/insightEngine';
import { Award, Trophy, Star, Zap, TrendingUp, Target, Download } from 'lucide-react';
import Certificate from '../components/Certificate';

const badgeIcons: Record<string, any> = {
  budget_keeper: Target,
  smart_spender: Zap,
  tracking_champion: Star,
  savings_streak: TrendingUp,
};

const badgeColors: Record<string, string> = {
  budget_keeper: 'from-green-400 to-emerald-500',
  smart_spender: 'from-blue-400 to-cyan-500',
  tracking_champion: 'from-yellow-400 to-orange-500',
  savings_streak: 'from-purple-400 to-pink-500',
  saver_of_week: 'from-teal-400 to-cyan-500',
  saver_of_month: 'from-blue-400 to-purple-500',
  super_saver_week: 'from-orange-400 to-red-500',
  super_saver_month: 'from-pink-400 to-purple-600',
};

const badgeDescriptions: Record<string, string> = {
  budget_keeper: 'Stayed within monthly budget',
  smart_spender: 'Prioritized needs over wants',
  tracking_champion: 'Logged 20+ expenses',
  savings_streak: 'Consistent savings habit',
  saver_of_week: 'Reduced spending compared to last week',
  saver_of_month: 'Reduced spending compared to last month',
  super_saver_week: 'Reduced spending by 20%+ this week',
  super_saver_month: 'Reduced spending by 20%+ this month',
};

export default function Rewards() {
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRewardsData();
    }
  }, [user]);

  const fetchRewardsData = async () => {
    if (!user) return;

    try {
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0]);

      if (expensesError) throw expensesError;

      setBadges(badgesData || []);
      setExpenses(expensesData || []);

      const calculatedPoints = (badgesData?.length || 0) * 100 + (expensesData?.length || 0) * 5;
      setPoints(calculatedPoints);

      const currentBadgeTypes = badgesData?.map((b) => b.badge_type) || [];
      const newBadges = checkBadgeEligibility(
        expensesData || [],
        profile?.monthly_budget || 0,
        currentBadgeTypes
      );

      for (const badge of newBadges) {
        await supabase.from('badges').insert([
          {
            user_id: user.id,
            badge_name: badge.name,
            badge_type: badge.type,
          },
        ]);
      }

      if (newBadges.length > 0) {
        fetchRewardsData();
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allBadgeTypes = [
    {
      type: 'budget_keeper',
      name: 'Budget Keeper',
      description: 'Stay within your monthly budget',
      requirement: 'Keep spending under budget for a month',
    },
    {
      type: 'smart_spender',
      name: 'Smart Spender',
      description: 'Prioritize needs over wants',
      requirement: 'Spend 60% or more on needs',
    },
    {
      type: 'tracking_champion',
      name: 'Tracking Champion',
      description: 'Consistently track your expenses',
      requirement: 'Log 20 or more expenses',
    },
    {
      type: 'savings_streak',
      name: 'Savings Streak',
      description: 'Build a consistent savings habit',
      requirement: 'Save consistently for 3 months',
    },
  ];

  const earnedBadgeTypes = badges.map((b) => b.badge_type);

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
        <h1 className="text-3xl font-bold text-gray-800">Rewards & Achievements</h1>
        <p className="text-gray-500 mt-1">
          Earn badges and points for smart financial behavior
        </p>
      </div>

      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-2xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="w-10 h-10" />
              <p className="text-2xl font-bold">Your Points</p>
            </div>
            <p className="text-5xl font-bold">{points}</p>
            <p className="text-yellow-100 mt-2">
              {badges.length} badges earned • {expenses.length} expenses tracked this month
            </p>
          </div>
          <div className="hidden md:block">
            <Award className="w-32 h-32 opacity-30" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Points Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-teal-600" />
                <span className="text-gray-700">Badges Earned</span>
              </div>
              <span className="font-bold text-gray-800">
                {badges.length} × 100 = {badges.length * 100} pts
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Expenses Tracked</span>
              </div>
              <span className="font-bold text-gray-800">
                {expenses.length} × 5 = {expenses.length * 5} pts
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Level Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Current Level</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  {Math.floor(points / 500) + 1}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${(points % 500) / 5}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {500 - (points % 500)} points to next level
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Badges</h2>
        {badges.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No badges earned yet. Start tracking expenses and meeting goals to earn rewards!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => {
              const Icon = badgeIcons[badge.badge_type] || Award;
              const color = badgeColors[badge.badge_type] || 'from-gray-400 to-gray-600';

              return (
                <div
                  key={badge.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
                >
                  <div
                    className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-center text-lg">
                    {badge.badge_name}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <p className="text-center text-teal-600 font-semibold">+100 points</p>
                    <button
                      onClick={() => {
                        setSelectedBadge(badge);
                        setShowCertificate(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Get Certificate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCertificate && selectedBadge && profile && (
        <Certificate
          userName={profile.name}
          badgeName={selectedBadge.badge_name}
          badgeDescription={badgeDescriptions[selectedBadge.badge_type] || 'Achievement unlocked'}
          earnedDate={selectedBadge.earned_at}
          onClose={() => {
            setShowCertificate(false);
            setSelectedBadge(null);
          }}
        />
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allBadgeTypes.map((badge) => {
            const earned = earnedBadgeTypes.includes(badge.type);
            const Icon = badgeIcons[badge.type] || Award;
            const color = badgeColors[badge.type] || 'from-gray-400 to-gray-600';

            return (
              <div
                key={badge.type}
                className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${
                  earned ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-800 text-lg">{badge.name}</h3>
                      {earned && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{badge.requirement}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

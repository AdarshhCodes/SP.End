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
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter uppercase italic transition-colors">Prestige & Rewards</h1>
        <p className="text-slate-500 dark:text-gray-500 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] transition-colors">Financial excellence certification</p>
      </div>

      <div className="bg-gradient-to-br from-[#064e3b] via-[#0d9488] to-[#0f172a] rounded-[32px] shadow-2xl p-10 mb-10 text-white relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full animate-pulse" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              <div className="p-4 bg-black/40 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/10">
                <Trophy className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-2xl font-black uppercase tracking-widest italic">Net Prestige Score</p>
            </div>
            <p className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl italic">
              {points.toLocaleString()}
            </p>
            <p className="text-emerald-300 font-bold mt-4 uppercase tracking-[0.24em] text-xs">
              {badges.length} Protocols Earned • {expenses.length} Operations Logs
            </p>
          </div>
          <div className="relative group-hover:scale-110 transition-transform duration-700">
            <Award className="w-48 h-48 text-emerald-500/20" />
            <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="glass-card rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-xl transition-all duration-500">
          <h2 className="text-xs font-black text-slate-500 dark:text-gray-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-3 transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Prestige Algorithm
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl group hover:bg-emerald-50 dark:hover:bg-white/10 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-bold dark:text-white text-slate-900 uppercase tracking-widest transition-colors">Protocol Bonus</span>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg transition-colors">
                {badges.length * 100} pts
              </span>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl group hover:bg-emerald-50 dark:hover:bg-white/10 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <Star className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-xs font-bold dark:text-white text-slate-900 uppercase tracking-widest transition-colors">Operation Logs</span>
              </div>
              <span className="font-black text-teal-600 dark:text-teal-400 text-lg transition-colors">
                {expenses.length * 5} pts
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-xl transition-all duration-500">
          <h2 className="text-xs font-black text-slate-500 dark:text-gray-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-3 transition-colors">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Seniority Evolution
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Clearance Level</span>
                <span className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-400 dark:to-teal-600 transition-colors">
                  {Math.floor(points / 500) + 1}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#051410] rounded-full h-4 overflow-hidden shadow-inner border border-slate-200 dark:border-white/5 transition-colors">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  style={{ width: `${(points % 500) / 5}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 mt-4 uppercase tracking-[0.2em] text-right italic transition-colors">
                {500 - (points % 500)} units to next clearance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-black dark:text-white text-slate-900 mb-8 uppercase tracking-tighter italic flex items-center gap-4 transition-colors">
          <Award className="w-6 h-6 text-emerald-500" />
          Earned Certificates
        </h2>
        {badges.length === 0 ? (
          <div className="glass-card rounded-[32px] p-24 text-center border-dashed border-2 border-white/10">
            <Award className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">
              No certifications issued for current user session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {badges.map((badge) => {
              const Icon = badgeIcons[badge.badge_type] || Award;
              const color = badgeColors[badge.badge_type] || 'from-gray-400 to-gray-600';

              return (
                <div
                  key={badge.id}
                  className="glass-card rounded-[32px] p-8 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                  <div
                    className={`w-24 h-24 mx-auto rounded-[28px] bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                  <h3 className="font-black dark:text-white text-slate-900 text-center text-xl uppercase tracking-tighter italic transition-colors">
                    {badge.badge_name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 text-center mt-3 uppercase tracking-widest transition-colors">
                    Authorized {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                  <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 space-y-4 transition-colors">
                    <p className="text-center text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-widest transition-colors">+100 PRESTIGE</p>
                    <button
                      onClick={() => {
                        setSelectedBadge(badge);
                        setShowCertificate(true);
                      }}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-black rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/10 text-xs uppercase tracking-tighter transform active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      <span>Issue Certificate</span>
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
        <h2 className="text-xl font-black dark:text-white text-slate-900 mb-8 uppercase tracking-tighter italic flex items-center gap-4 transition-colors">
          <Trophy className="w-6 h-6 text-emerald-500" />
          Clearance Protocols
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allBadgeTypes.map((badge) => {
            const earned = earnedBadgeTypes.includes(badge.type);
            const Icon = badgeIcons[badge.type] || Award;
            const color = badgeColors[badge.type] || 'from-gray-400 to-gray-600';

            return (
              <div
                key={badge.type}
                className={`glass-card rounded-[32px] p-8 border border-slate-200 dark:border-white/5 transition-all duration-500 ${earned ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                <div className="flex items-start space-x-6">
                  <div
                    className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black dark:text-white text-slate-900 text-lg uppercase tracking-tighter italic transition-colors">{badge.name}</h3>
                      {earned && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                            Unlocked
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-gray-500 mt-2 uppercase tracking-wide leading-relaxed transition-colors">{badge.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-500 transition-colors" />
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/80 uppercase tracking-[0.2em] transition-colors">{badge.requirement}</p>
                    </div>
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

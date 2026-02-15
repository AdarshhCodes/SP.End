import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Goal } from '../lib/supabase';
import { Target, Plus, Trash2, Edit2, TrendingUp, Calendar } from 'lucide-react';

export default function Goals() {
  const { user, profile, refreshProfile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
  });
  const [monthlyBudget, setMonthlyBudget] = useState('');

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setMonthlyBudget(profile.monthly_budget.toString());
    }
  }, [profile]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
     const { error } = await supabase.from('goals').insert([
  {
    user_id: user.id,
    goal_name: newGoal.title.trim(),
    target_amount: parseFloat(newGoal.target_amount),
    deadline: newGoal.deadline || null,
    current_amount: 0,
  },
]);


      if (error) throw error;

      setNewGoal({ title: '', target_amount: '', deadline: '' });
      setShowAddGoal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);

      if (error) throw error;
      setGoals(goals.filter((goal) => goal.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleUpdateProgress = async (id: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: amount })
        .eq('id', id);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_budget: parseFloat(monthlyBudget) })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setShowBudgetModal(false);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-400 to-emerald-500';
    if (percentage >= 75) return 'from-blue-400 to-cyan-500';
    if (percentage >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter uppercase italic transition-colors">Strategic Goals</h1>
          <p className="text-slate-500 dark:text-gray-500 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] transition-colors">Financial trajectory & budgeting</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center space-x-3 bg-emerald-500 hover:bg-emerald-600 text-black px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 transform active:scale-95 uppercase tracking-tighter"
        >
          <Plus className="w-6 h-6" />
          <span>New Acquisition Goal</span>
        </button>
      </div>

      <div className="gradient-card-green rounded-[32px] shadow-2xl p-10 mb-10 relative overflow-hidden group">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full animate-pulse" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-[0.3em]">Operating Capital (Monthly)</p>
            <p className="text-4xl md:text-5xl font-black text-black tracking-tighter italic">
              ${profile?.monthly_budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center justify-center space-x-2 bg-black text-white px-6 py-4 md:py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20 uppercase tracking-widest text-[10px] w-full md:w-auto"
          >
            <Edit2 className="w-4 h-4" />
            <span>Refactor Budget</span>
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="glass-card rounded-[32px] p-24 text-center border-dashed border-2 border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <Target className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] mb-8 text-sm transition-colors">No active strategic objectives detected.</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-emerald-600 dark:text-white px-8 py-4 rounded-2xl font-bold transition-all border border-slate-200 dark:border-white/10 uppercase tracking-widest text-xs"
            >
              Initiate First Goal
            </button>
          </div>
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {goals.map((goal) => {
            const percentage = (goal.current_amount / goal.target_amount) * 100;
            const isComplete = percentage >= 100;

            return (
              <div
                key={goal.id}
                className="glass-card rounded-[32px] p-8 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="font-black dark:text-white text-slate-900 text-xl uppercase tracking-tighter group-hover:text-emerald-500 transition-colors italic">{goal.goal_name}</h3>
                    {goal.deadline && (
                      <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <Calendar className="w-3 h-3" />
                        Target: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest transition-colors">Efficiency Status</span>
                    <span className={`text-sm font-black transition-colors ${isComplete ? 'text-emerald-500 animate-pulse' : 'dark:text-white text-slate-900'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#051410] rounded-full h-4 overflow-hidden shadow-inner border border-slate-200 dark:border-white/5 transition-colors">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressColor(
                        percentage
                      )} transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/20`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 bg-slate-100 dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/5 transition-colors">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1">Accumulated</p>
                    <p className="text-2xl font-black dark:text-white text-slate-900 italic transition-colors">
                      ${goal.current_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <TrendingUp className={`w-5 h-5 ${isComplete ? 'text-emerald-500' : 'text-slate-400 dark:text-gray-600'}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1">Threshold</p>
                    <p className="text-2xl font-black dark:text-white text-slate-900 italic transition-colors">
                      ${goal.target_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {!isComplete && (
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Incr. amount"
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white text-slate-900 text-sm font-bold dark:placeholder-gray-600 placeholder-slate-400 transition-colors"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const amount = parseFloat(input.value);
                            if (amount > 0) {
                              handleUpdateProgress(goal.id, goal.current_amount + amount);
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                        const amount = parseFloat(input.value);
                        if (amount > 0) {
                          handleUpdateProgress(goal.id, goal.current_amount + amount);
                          input.value = '';
                        }
                      }}
                      className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-black text-xs hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10 uppercase tracking-tighter"
                    >
                      Allocate
                    </button>
                  </div>
                )}

                {isComplete && (
                  <div className="bg-emerald-500 text-black px-6 py-4 rounded-2xl text-center font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/30 italic">
                    Objective Accomplished
                  </div>
                )}
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#051410]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-colors">
          <div className="glass-card rounded-[32px] p-10 max-w-md w-full border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-emerald-500/10 blur-[80px] rounded-full" />
            <h2 className="text-2xl font-black dark:text-white text-slate-900 mb-8 uppercase tracking-tighter italic transition-colors">Create Objective</h2>
            <form onSubmit={handleAddGoal} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] ml-2 transition-colors">
                  Objective Designation
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white text-slate-900 font-bold dark:placeholder-gray-600 placeholder-slate-400"
                  placeholder="e.g., Luxury Exploration"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] ml-2 transition-colors">
                  Capital Threshold ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white text-slate-900 font-bold dark:placeholder-gray-600 placeholder-slate-400"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] ml-2 transition-colors">
                  Temporal Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white text-slate-900 font-bold dark:color-scheme-dark"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-4 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition uppercase tracking-widest text-[10px]"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-emerald-500 text-black rounded-2xl font-black transition-all hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 uppercase tracking-tighter"
                >
                  Confirm Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#051410]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-colors">
          <div className="glass-card rounded-[32px] p-10 max-w-md w-full border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] bg-emerald-500/10 blur-[80px] rounded-full" />
            <h2 className="text-2xl font-black dark:text-white text-slate-900 mb-8 uppercase tracking-tighter italic transition-colors">Budget Refactoring</h2>
            <form onSubmit={handleUpdateBudget} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-[0.2em] ml-2 transition-colors">
                  Monthly Capital Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white text-slate-900 font-extra-bold text-2xl"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 px-4 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-emerald-500 text-black rounded-2xl font-black transition-all hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 uppercase tracking-tighter"
                >
                  Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

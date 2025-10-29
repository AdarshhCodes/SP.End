import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Goal } from '../lib/supabase';
import { Target, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';

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
          title: newGoal.title,
          target_amount: parseFloat(newGoal.target_amount),
          deadline: newGoal.deadline || null,
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
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Goals & Budget</h1>
          <p className="text-gray-500 mt-1">Set targets and track your progress</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-teal-600 hover:to-blue-700 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-teal-100 mb-2">Monthly Budget</p>
            <p className="text-4xl font-bold">${profile?.monthly_budget.toFixed(2) || '0.00'}</p>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Budget</span>
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No goals yet. Start by creating your first goal!</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-teal-600 hover:to-blue-700 transition shadow-lg inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const percentage = (goal.current_amount / goal.target_amount) * 100;
            const isComplete = percentage >= 100;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{goal.title}</h3>
                    {goal.deadline && (
                      <p className="text-sm text-gray-500 mt-1">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-gray-800">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressColor(
                        percentage
                      )} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current</p>
                    <p className="text-xl font-bold text-gray-800">
                      ${goal.current_amount.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-300" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Target</p>
                    <p className="text-xl font-bold text-gray-800">
                      ${goal.target_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {!isComplete && (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Add amount"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const amount = parseFloat(input.value);
                        if (amount > 0) {
                          handleUpdateProgress(goal.id, goal.current_amount + amount);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                    >
                      Add
                    </button>
                  </div>
                )}

                {isComplete && (
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center font-medium">
                    Goal Achieved!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Save for vacation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-blue-700 transition"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Monthly Budget</h2>
            <form onSubmit={handleUpdateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Budget
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Expense } from '../lib/supabase';
import { getCategoryColor } from '../utils/insightEngine';
import { Search, Filter, Trash2, ArrowUpDown } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [expenses, searchTerm, categoryFilter, sortBy, sortOrder]);

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter((exp) =>
        exp.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((exp) => exp.category === categoryFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;
      setExpenses(expenses.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const toggleSort = (type: 'date' | 'amount') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900 transition-colors">Spending History</h1>
        <p className="dark:text-gray-500 text-slate-500 mt-1 transition-colors">
          View and manage all your tracked expenses
        </p>
      </div>

      <div className="glass-card rounded-[32px] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all dark:text-white text-slate-900 dark:placeholder-gray-600 placeholder-slate-400"
              placeholder="Search history..."
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all dark:text-white text-slate-900 appearance-none cursor-pointer"
            >
              <option value="All" className="dark:bg-[#1a231e] bg-white">All Categories</option>
              <option value="Food" className="dark:bg-[#1a231e] bg-white">Food</option>
              <option value="Shopping" className="dark:bg-[#1a231e] bg-white">Shopping</option>
              <option value="Travel" className="dark:bg-[#1a231e] bg-white">Travel</option>
              <option value="Bills" className="dark:bg-[#1a231e] bg-white">Bills</option>
              <option value="Other" className="dark:bg-[#1a231e] bg-white">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleSort('date')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border transition-all duration-300 ${sortBy === 'date'
                ? 'bg-emerald-500 border-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10'
                }`}
            >
              <span className="text-xs uppercase tracking-widest">Date</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border transition-all duration-300 ${sortBy === 'amount'
                ? 'bg-emerald-500 border-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10'
                }`}
            >
              <span className="text-xs uppercase tracking-widest">Amount</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-6">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Showing {filteredExpenses.length} entries
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Total Aggregate</span>
            <p className="text-2xl font-black text-emerald-400">
              ${totalFiltered.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="glass-card rounded-[32px] p-20 text-center border-dashed border-2 border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No records found matching your filters</p>
        </div>
      ) : (
        <div className="glass-card rounded-[32px] overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="group flex items-center justify-between p-6 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center space-x-6 flex-1">
                  <div
                    className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${getCategoryColor(
                      expense.category
                    )} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <span className="text-white font-black text-xl">
                      {expense.category.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold dark:text-white text-slate-900 text-lg truncate group-hover:text-emerald-500 transition-colors">
                      {expense.item_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{expense.category}</span>
                      <span className="text-slate-300 dark:text-gray-700 font-black">•</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{expense.date}</span>
                      <span
                        className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${expense.expense_type === 'need'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                      >
                        {expense.expense_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <p className="font-black dark:text-white text-slate-900 text-xl">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

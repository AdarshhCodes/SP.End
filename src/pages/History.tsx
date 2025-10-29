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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Spending History</h1>
        <p className="text-gray-500 mt-1">
          View and manage all your tracked expenses
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="Search expenses..."
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => toggleSort('date')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition ${
                sortBy === 'date'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">Date</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition ${
                sortBy === 'amount'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">Amount</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </p>
          <p className="text-sm font-semibold text-gray-800">
            Total: ${totalFiltered.toFixed(2)}
          </p>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <p className="text-gray-500">No expenses found matching your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(
                      expense.category
                    )} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-lg">
                      {expense.category.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {expense.item_name}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500">{expense.category}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{expense.date}</span>
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
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-bold text-gray-800 text-lg">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

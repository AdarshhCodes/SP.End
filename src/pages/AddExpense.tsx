import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, ShoppingBag, Coffee, Plane, FileText, MoreHorizontal } from 'lucide-react';

const categories = [
  { name: 'Food', icon: Coffee, color: 'from-orange-400 to-red-500' },
  { name: 'Shopping', icon: ShoppingBag, color: 'from-pink-400 to-purple-500' },
  { name: 'Travel', icon: Plane, color: 'from-blue-400 to-cyan-500' },
  { name: 'Bills', icon: FileText, color: 'from-yellow-400 to-orange-500' },
  { name: 'Other', icon: MoreHorizontal, color: 'from-gray-400 to-gray-600' },
];

export default function AddExpense() {
  const { user } = useAuth();
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food');
  const [expenseType, setExpenseType] = useState<'need' | 'want'>('want');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: insertError } = await supabase.from('expenses').insert([
        {
          user_id: user.id,
          item_name: itemName,
          amount: parseFloat(amount),
          category,
          expense_type: expenseType,
          date,
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setItemName('');
      setAmount('');
      setCategory('Food');
      setExpenseType('want');
      setDate(new Date().toISOString().split('T')[0]);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Add Expense</h1>
        <p className="text-gray-500 mt-1">Track your spending item by item</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="e.g., Coffee at Starbucks, New shoes"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-4 rounded-xl border-2 transition ${
                      category === cat.name
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center">
                      {cat.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Expense Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setExpenseType('need')}
                className={`p-4 rounded-xl border-2 transition ${
                  expenseType === 'need'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-800">Need</p>
                <p className="text-xs text-gray-500 mt-1">
                  Essential expenses like groceries, bills
                </p>
              </button>
              <button
                type="button"
                onClick={() => setExpenseType('want')}
                className={`p-4 rounded-xl border-2 transition ${
                  expenseType === 'want'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-800">Want</p>
                <p className="text-xs text-gray-500 mt-1">
                  Non-essential like dining out, entertainment
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm">
              Expense added successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-xl font-medium hover:from-teal-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{loading ? 'Adding...' : 'Add Expense'}</span>
          </button>
        </form>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-2">Context-Aware Categorization</h3>
        <p className="text-sm text-gray-600">
          Our smart engine tracks whether expenses are needs or wants, helping you identify
          spending patterns and make better financial decisions. Be honest with categorization
          for the most accurate insights!
        </p>
      </div>
    </div>
  );
}

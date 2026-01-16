import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, ShoppingBag, Coffee, Plane, FileText, MoreHorizontal } from 'lucide-react';
import ScanReceiptButton from "../utils/receipt/ScanReceiptButton";
import { parseReceiptText } from "../utils/receipt/receiptParser";

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

  const handleReceiptScan = (ocrText: string) => {
    const parsed = parseReceiptText(ocrText);

    if (parsed.amount.confidence !== "LOW" && parsed.amount.value !== null) {
      setAmount(parsed.amount.value.toString());
    }

    if (parsed.merchantName.confidence !== "LOW" && parsed.merchantName.value) {
      setItemName(parsed.merchantName.value);
    }

    if (parsed.category.confidence === "HIGH" && parsed.category.value) {
      setCategory(parsed.category.value);
    }

    if (parsed.date.confidence === "HIGH" && parsed.date.value) {
      setDate(parsed.date.value.toISOString().split("T")[0]);
    }
  };


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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900 transition-colors">Add Expense</h1>
        <p className="dark:text-gray-500 text-slate-500 mt-1 transition-colors">Track your spending item by item</p>
      </div>

      <div className="glass-card rounded-[32px] p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">
                Item Name
              </label>
    {/* Scan Receipt Button  */}
                <ScanReceiptButton onScanComplete={handleReceiptScan} />
              </div>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all dark:text-white text-slate-900 dark:placeholder-gray-600 placeholder-slate-400 shadow-inner"
                placeholder="e.g., Starbucks Coffee"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">
                Amount
              </label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all dark:text-white text-slate-900 dark:placeholder-gray-600 placeholder-slate-400 shadow-inner font-bold text-xl"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-4 rounded-[24px] border transition-all duration-300 group flex flex-col items-center justify-center space-y-3 ${isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-emerald-500/30'
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {cat.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">
              Expense Priority
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setExpenseType('need')}
                className={`p-6 rounded-[24px] border-2 transition-all duration-300 flex items-start space-x-4 ${expenseType === 'need'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-emerald-500/30'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${expenseType === 'need' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}`}>
                  {expenseType === 'need' && <Plus className="w-4 h-4 text-black" />}
                </div>
                <div className="text-left">
                  <p className={`font-bold ${expenseType === 'need' ? 'text-emerald-400' : 'text-gray-400'}`}>Essential (Need)</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Groceries, rent, bills</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setExpenseType('want')}
                className={`p-6 rounded-[24px] border-2 transition-all duration-300 flex items-start space-x-4 ${expenseType === 'want'
                  ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-purple-500/30'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${expenseType === 'want' ? 'border-purple-500 bg-purple-500' : 'border-gray-600'}`}>
                  {expenseType === 'want' && <Plus className="w-4 h-4 text-black" />}
                </div>
                <div className="text-left">
                  <p className={`font-bold ${expenseType === 'want' ? 'text-purple-400' : 'text-gray-400'}`}>Lifestyle (Want)</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Dining out, entertainment</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all dark:text-white text-slate-900 dark:color-scheme-dark"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center">
              ✅ Expense logged successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 uppercase tracking-tighter"
          >
            <Plus className="w-6 h-6" />
            <span>{loading ? 'Processing...' : 'Securely Log Expense'}</span>
          </button>
        </form>
      </div>

      <div className="mt-8 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-[#062d24] dark:to-[#041a16] rounded-[32px] p-8 border border-emerald-200 dark:border-emerald-500/10 relative overflow-hidden group shadow-2xl transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-500/20 backdrop-blur-md">
            <ShoppingBag className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-xl dark:text-white text-emerald-900 mb-2 transition-colors">Smart Categorization Engine</h3>
            <p className="text-sm dark:text-emerald-100/70 text-emerald-800/80 leading-relaxed transition-colors font-medium">
              Our advanced analytical engine uses a Needs vs. Wants framework to help you unlock deeper financial insights. Accurate logging is the cornerstone of your journey towards financial freedom.
            </p>
          </div>
        </div>
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-700" />
      </div>
    </div>
  );
}

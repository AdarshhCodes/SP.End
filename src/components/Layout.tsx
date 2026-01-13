import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, Plus, History, Target, Menu, X, Award, TrendingUp, Settings, HelpCircle, Sun, Moon } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add Expense', icon: Plus },
    { id: 'history', label: 'History', icon: History },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'rewards', label: 'Rewards', icon: Award },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Dynamic Animated Background Layers (Global feel) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000 gpu-accelerated">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-200/30 dark:bg-[#064e3b]/20 rounded-full blur-[120px] animate-radial-loop" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-teal-100/20 dark:bg-[#0d9488]/15 rounded-full blur-[120px] animate-radial-loop-reverse" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] brightness-150 contrast-150 mix-blend-overlay bg-noise" />
      </div>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-[#1a231e]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 z-30 lg:hidden transition-colors duration-500">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-black font-black text-[10px] italic">SP</span>
            </div>
            <h1 className="text-xl font-bold dark:text-white text-slate-900 tracking-tight">SP.End</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-emerald-500 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-emerald-500 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/90 dark:bg-[#1a231e]/90 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 z-40 transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 w-72 shadow-2xl`}
      >
        <div className="flex flex-col h-full p-8 relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/10">
              <span className="text-black font-black text-lg italic">SP</span>
            </div>
            <h1 className="text-2xl font-black dark:text-white text-slate-900 tracking-tighter">
              SP.End
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.25em] mb-6 ml-4">Main Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20 text-black font-bold scale-[1.02]'
                    : 'text-slate-500 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/5'
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-black/10' : 'bg-transparent group-hover:bg-emerald-500/10'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'group-hover:text-emerald-500'}`} />
                  </div>
                  <span className="text-sm tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-6 pt-8 border-t border-slate-200 dark:border-white/5">
            <div className="space-y-1">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-4 px-4 py-2 text-slate-500 dark:text-gray-500 hover:text-emerald-500 transition-colors group"
              >
                <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <span className="text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button className="w-full flex items-center space-x-4 px-4 py-2 text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                  <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </div>
                <span className="text-sm">Settings</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-[24px] p-4 flex items-center space-x-3 border border-slate-200 dark:border-white/5 shadow-inner transition-colors duration-500">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 overflow-hidden shadow-lg p-0.5 bg-emerald-500/10">
                <img src={`https://ui-avatars.com/api/?name=${profile?.name}&background=random`} alt="User" className="rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold dark:text-white text-slate-900 truncate">{profile?.name || 'User'}</p>
                <button
                  onClick={handleSignOut}
                  className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-72 min-h-screen relative z-10 p-4 pt-24 lg:pt-4 transition-all duration-500">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}


import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Plus, History, Target, Menu, X, Award, TrendingUp, Settings, HelpCircle } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
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
    <div className="min-h-screen bg-[#F4F7FE]">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">SP</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">SP.End</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/70 backdrop-blur-xl border-r border-gray-100 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 w-72 shadow-2xl shadow-gray-200/50`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-white font-extrabold text-lg italic">SP</span>
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter">
              SP.End
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
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
                  className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                    ? 'bg-white shadow-xl shadow-gray-200/50 text-teal-600 font-bold scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'bg-transparent'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-6 pt-8 border-t border-gray-50">
            <div className="space-y-1">
              <button className="w-full flex items-center space-x-4 px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </button>
              <button className="w-full flex items-center space-x-4 px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm">Help Center</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 flex items-center space-x-3 border border-white/50">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                <img src={`https://ui-avatars.com/api/?name=${profile?.name}&background=random`} alt="User" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{profile?.name || 'User'}</p>
                <button
                  onClick={handleSignOut}
                  className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest"
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-72 min-h-screen">
        <div className="">{children}</div>
      </main>
    </div>
  );
}


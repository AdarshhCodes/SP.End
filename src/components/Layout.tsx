import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import FloatingNavbar from './FloatingNavbar';

type LayoutProps = {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen dashboard-bg transition-colors duration-500">
      {/* Floating Navbar - The primary navigation now */}
      <FloatingNavbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isVisible={isNavVisible}
      />

      {/* Dynamic Animated Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000 gpu-accelerated">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-200/30 dark:bg-[#064e3b]/20 rounded-full blur-[120px] animate-radial-loop" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-teal-100/20 dark:bg-[#0d9488]/15 rounded-full blur-[120px] animate-radial-loop-reverse" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] brightness-150 contrast-150 mix-blend-overlay bg-noise" />
      </div>

      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 h-24 pt-8 bg-white/60 dark:bg-[#1a231e]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 z-40 transition-all duration-500">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-black font-black text-xs italic">SP</span>
            </div>
            <h1 className="text-2xl font-black dark:text-white text-slate-900 tracking-tighter">SP.End</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-300"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-white/10">
              <div
                className="w-10 h-10 rounded-full border-2 border-emerald-500/20 overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors"
                onClick={() => onNavigate('settings')}
              >
                <img src={`https://ui-avatars.com/api/?name=${profile?.name}&background=random`} alt="User" />
              </div>
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all duration-300"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen relative z-10 p-4 pt-32 pb-32 transition-all duration-500">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}


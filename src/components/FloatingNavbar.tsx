import { LayoutDashboard, Plus, History, Target, Award, TrendingUp, Settings } from 'lucide-react';

type FloatingNavbarProps = {
    currentPage: string;
    onNavigate: (page: string) => void;
    isVisible: boolean;
};

export default function FloatingNavbar({ currentPage, onNavigate, isVisible }: FloatingNavbarProps) {
    const leftItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'insights', icon: TrendingUp, label: 'Insights' },
    ];

    const rightItems = [
        { id: 'rewards', icon: Award, label: 'Rewards' },
        { id: 'goals', icon: Target, label: 'Goals' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
                }`}
        >
            <div className="relative flex items-center bg-white/80 dark:bg-[#1a231e]/80 backdrop-blur-2xl px-4 py-2.5 rounded-[32px] border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] min-w-[300px] max-w-[95vw] justify-between">

                {/* Left Items */}
                <div className="flex items-center space-x-3 sm:space-x-5">
                    {leftItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`relative p-2 transition-all duration-300 ${isActive ? 'text-emerald-500 scale-110' : 'text-slate-400 dark:text-gray-500 hover:text-emerald-400'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Center Plus Button */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <button
                        onClick={() => onNavigate('add-expense')}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.4)] border-4 border-white dark:border-[#1a231e] transition-transform hover:scale-110 active:scale-95 group"
                    >
                        <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Spacer for Center Button */}
                <div className="w-12" />

                {/* Right Items */}
                <div className="flex items-center space-x-3 sm:space-x-5">
                    {rightItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`relative p-2 transition-all duration-300 ${isActive ? 'text-emerald-500 scale-110' : 'text-slate-400 dark:text-gray-500 hover:text-emerald-400'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

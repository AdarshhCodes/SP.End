import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, LogOut, User, Bell, Shield, HelpCircle } from 'lucide-react';

export default function Settings() {
    const { profile, signOut, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight">Settings</h1>
            </div>

            {/* Profile Section */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/20 dark:border-white/10 shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 overflow-hidden shadow-2xl p-1 bg-emerald-500/10">
                        <img
                            src={`https://ui-avatars.com/api/?name=${profile?.name}&background=random&size=128`}
                            alt="User"
                            className="rounded-full w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold dark:text-white text-slate-900 truncate">{profile?.name || 'User'}</h2>
                        <p className="text-sm text-slate-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-500/50 uppercase tracking-[0.25em] ml-4">Preferences</h3>
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-6 hover:bg-emerald-500/5 transition-colors group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                                {theme === 'light' ? <Moon className="w-6 h-6 text-slate-600 dark:text-gray-400" /> : <Sun className="w-6 h-6 text-emerald-500" />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold dark:text-white text-slate-900">Appearance</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-500/50 uppercase tracking-[0.25em] ml-4">Account</h3>
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl">
                    <button className="w-full flex items-center space-x-4 p-6 hover:bg-emerald-500/5 transition-colors group border-b border-white/10">
                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                            <User className="w-6 h-6 text-slate-600 dark:text-gray-400 group-hover:text-emerald-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold dark:text-white text-slate-900">Edit Profile</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Change your name or avatar</p>
                        </div>
                    </button>

                    <button className="w-full flex items-center space-x-4 p-6 hover:bg-emerald-500/5 transition-colors group border-b border-white/10">
                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                            <Bell className="w-6 h-6 text-slate-600 dark:text-gray-400 group-hover:text-emerald-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold dark:text-white text-slate-900">Notifications</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Manage your alerts</p>
                        </div>
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-4 p-6 hover:bg-red-500/5 transition-colors group"
                    >
                        <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-red-500">Sign Out</p>
                            <p className="text-xs text-red-500/60">Log out of your account</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-500/50 uppercase tracking-[0.25em] ml-4">Support</h3>
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl">
                    <button className="w-full flex items-center space-x-4 p-6 hover:bg-emerald-500/5 transition-colors group border-b border-white/10">
                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                            <Shield className="w-6 h-6 text-slate-600 dark:text-gray-400 group-hover:text-emerald-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold dark:text-white text-slate-900">Privacy Policy</p>
                        </div>
                    </button>
                    <button className="w-full flex items-center space-x-4 p-6 hover:bg-emerald-500/5 transition-colors group">
                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                            <HelpCircle className="w-6 h-6 text-slate-600 dark:text-gray-400 group-hover:text-emerald-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold dark:text-white text-slate-900">Help & Feedback</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

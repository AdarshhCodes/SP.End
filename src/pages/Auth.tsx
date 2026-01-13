import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react';
import bgImage from '../assets/pexels-nandhukumar-312839.jpg';
import logo from '../assets/logo.png';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#051410] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-gray-200">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#051410]" />

        {/* Animated Radial Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-[#064e3b]/40 rounded-full blur-[120px] animate-radial-loop" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#0d9488]/30 rounded-full blur-[120px] animate-radial-loop-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#1c4538]/20 rounded-full blur-[140px] animate-pulse" />

        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none brightness-150 contrast-150 mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      <style>{`
        @keyframes radial-loop {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(8%, 5%) scale(1.1) rotate(5deg); }
          66% { transform: translate(-5%, 10%) scale(0.9) rotate(-5deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        @keyframes radial-loop-reverse {
          0% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
          33% { transform: translate(-10%, -8%) scale(0.9) rotate(-8deg); }
          66% { transform: translate(8%, -5%) scale(1.1) rotate(8deg); }
          100% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
        }
        .animate-radial-loop {
          animation: radial-loop 20s ease-in-out infinite;
        }
        .animate-radial-loop-reverse {
          animation: radial-loop-reverse 25s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 bg-[#1a231e]/80 backdrop-blur-2xl w-full max-w-[1000px] h-full min-h-[600px] rounded-[32px] overflow-hidden flex shadow-2xl border border-white/5">

        {/* Left Pane - Visual & Branding */}
        <div className="hidden lg:flex relative w-1/2 p-10 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={bgImage}
              alt="Serene Landscape"
              className="w-full h-full object-cover opacity-60 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051410] via-transparent to-[#051410]/30" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <img
                  src={logo}
                  alt="Serene Landscape"
                  className="w-full h-full object-cover opacity-100 scale-110"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">SP.End</span>
            </div>
            <button className="text-sm font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all flex items-center gap-2 border border-white/10">
              Back to website <ArrowRight size={16} />
            </button>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-semibold leading-tight text-white mb-4">
              Cultivating Harmony,<br />
              Nurturing Abundance
            </h2>
            <div className="flex gap-2">
              <div className="h-1 w-8 bg-emerald-500 rounded-full" />
              <div className="h-1 w-8 bg-white/20 rounded-full" />
              <div className="h-1 w-8 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Pane - Auth Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors decoration-emerald-400/30 underline-offset-4 hover:underline"
                >
                  {isSignUp ? 'Log in' : 'Sign up'}
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="text"
                      className="w-full bg-[#242f29] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder-gray-600"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-400 ml-1">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    className="w-full bg-[#242f29] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder-gray-600"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-[#242f29] border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder-gray-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 bg-[#242f29] border-white/10 rounded focus:ring-emerald-500 text-emerald-500 cursor-pointer"
                    required
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                  I agree to the <span className="text-emerald-400 hover:underline">Terms & Conditions</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0a0f0c] font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 bg-[#242f29] hover:bg-[#2d3a32] border border-white/5 text-gray-300 py-3 rounded-2xl transition-all">
                  <Chrome size={20} className="text-white" />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button className="flex items-center justify-center gap-3 bg-[#242f29] hover:bg-[#2d3a32] border border-white/5 text-gray-300 py-3 rounded-2xl transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.82-.78.897-1.467 2.338-1.284 3.713 1.348.104 2.717-.702 3.571-1.703z" />
                  </svg>
                  <span className="text-sm font-medium">Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

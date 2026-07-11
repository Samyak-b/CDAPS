import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCitizenLogin } from '../hooks/useAnalytics';
import { ShieldAlert, User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CitizenLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useCitizenLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password.');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ username, password });
      login(response.access_token);
      toast.success('Welcome! Login successful.');
      navigate('/citizen');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden relative">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[110px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[110px]" />

      <div className="z-10 w-full max-w-md p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95">
        
        {/* Portal switch back */}
        <Link 
          to="/citizen" 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-purple-400 gap-1.5 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Portal Map
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mx-auto mb-3">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">Citizen Security Sign In</h1>
          <p className="text-slate-400 text-xs font-medium">Log in to report incidents and trigger SOS dispatch alerts</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed transform hover:-translate-y-0.5 cursor-pointer"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Signing In...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Don't have a secure citizen profile?{' '}
            <Link to="/citizen/signup" className="text-purple-400 hover:text-purple-300 font-bold underline">
              Sign Up Here
            </Link>
          </p>
          <p className="text-[10px] text-slate-500">
            Are you a law enforcement officer?{' '}
            <Link to="/login" className="text-slate-400 hover:text-white font-semibold underline">
              Admin Login Portal
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default CitizenLogin;

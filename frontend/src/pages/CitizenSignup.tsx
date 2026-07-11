import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCitizenSignup, useCityList } from '../hooks/useAnalytics';
import { ShieldCheck, User, Lock, Mail, Tag, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CitizenSignup = () => {
  const navigate = useNavigate();
  const signupMutation = useCitizenSignup();
  const { data: availableCities } = useCityList();

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');

  const citiesList = availableCities || [
    'Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhopal', 'Patna', 'Chandigarh'
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !fullName || !city) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await signupMutation.mutateAsync({
        username,
        email,
        password,
        full_name: fullName,
        city
      });
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/citizen/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed. Username/Email might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-y-auto py-12 px-4 relative">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="z-10 w-full max-w-md p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
        
        <Link 
          to="/citizen" 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-purple-400 gap-1.5 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Portal Map
        </Link>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Citizen Profile</h1>
          <p className="text-slate-400 text-xs font-medium">Register for security reports logging and emergency tracking</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Tag className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm"
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm"
                placeholder="rahul@example.com"
                required
              />
            </div>
          </div>

          {/* City Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Jurisdiction City</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm appearance-none"
                required
              >
                <option value="" disabled>-- Select City --</option>
                {citiesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm"
                placeholder="e.g. rahul123"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed transform hover:-translate-y-0.5 cursor-pointer mt-2"
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Registering Profile...
              </>
            ) : (
              'Create Secure Profile'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 text-center">
          <p className="text-xs text-slate-400">
            Already have a citizen profile?{' '}
            <Link to="/citizen/login" className="text-purple-400 hover:text-purple-300 font-bold underline">
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default CitizenSignup;

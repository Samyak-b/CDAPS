import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Users, ChevronRight, Activity } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[130px] pointer-events-none" />

      {/* Header logo */}
      <header className="h-[80px] flex items-center justify-between px-8 max-w-7xl mx-auto w-full border-b border-white/5 z-10 relative">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-purple-400" />
          <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider">
            Crime Data Analysis and Prediction System
          </h1>
        </div>
        <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Project Core 2026</span>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 py-12 w-full z-10 relative">
        <div className="text-center max-w-3xl space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase tracking-widest">
            Geo-Spatial Analytics & Distress Dispatch
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Crime Data Analysis & <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Prediction System</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Choose your portal entry point. Access real-time citizen reporting mapping with distress beacons, or launch the administrative analytical command dashboard.
          </p>
        </div>

        {/* Portal Entrance Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 mb-8">
          
          {/* Card 1: Citizen Safety Portal */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl hover:border-purple-500/30 transition-all duration-300 shadow-2xl flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">Citizen Safety Portal</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Public safety resource center. Report local crime incidents, broadcast active distress SOS signals using live Geolocation telemetry, and review verified community warnings.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/citizen/login')}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm tracking-wide transition-all shadow hover:shadow-purple-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Citizen Sign In</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/citizen')}
                className="sm:w-44 py-3 px-4 rounded-xl bg-slate-950 border border-white/10 hover:bg-slate-800 hover:border-purple-500/30 text-slate-300 text-sm font-semibold tracking-wide transition-all cursor-pointer"
              >
                Enter as Guest
              </button>
            </div>
          </div>

          {/* Card 2: Police Admin Command */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl hover:border-amber-500/30 transition-all duration-300 shadow-2xl flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-300">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">Command Control Desk</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Authorized intelligence hub. Monitor geo-spatial crime aggregates, run SARIMA and Random Forest forecasting pipelines, and coordinate live SOS dispatch signals.
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-extrabold text-sm tracking-wide transition-all shadow hover:shadow-amber-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Police Admin Sign In</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="h-[60px] border-t border-white/5 flex items-center justify-center text-xs text-slate-500 z-10 relative">
        &copy; {new Date().getFullYear()} CDAPS. Vetted spatial intelligence operations.
      </footer>
    </div>
  );
};

export default Home;

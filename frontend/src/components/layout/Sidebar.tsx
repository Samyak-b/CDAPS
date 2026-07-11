import { Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, Activity, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout, token } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Map View', path: '/map', icon: MapIcon },
    { name: 'Prediction', path: '/prediction', icon: Activity },
  ];

  if (token) {
    links.push({ name: 'Community Reports', path: '/admin/reports', icon: ShieldAlert });
  }

  return (
    <div className="hidden md:flex w-64 h-screen bg-slate-950/80 border-r border-white/5 flex-col transition-all duration-300 z-50">
      <div className="p-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform origin-left cursor-default tracking-tight uppercase">
          CDAPS
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path || pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500/15 text-purple-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-purple-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              <span className="font-medium text-sm tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          to="/citizen"
          className="flex items-center justify-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 bg-slate-900/50 hover:bg-purple-500/15 hover:text-purple-400 hover:border-purple-500/30 border border-transparent transition-all duration-200 group"
        >
          <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Citizen Portal</span>
        </Link>
        <button 
          onClick={logout}
          className="flex items-center justify-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 bg-slate-900/50 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Disconnect</span>
        </button>
      </div>
    </div>
  );
};

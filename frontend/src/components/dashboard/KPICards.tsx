import { AlertTriangle, TrendingUp, ShieldCheck, MapPin, Building2, Activity } from 'lucide-react';
import { DashboardStats } from '../../hooks/useAnalytics';
import { useCityContext } from '../../contexts/CityContext';

interface Props {
  dashboardStats?: DashboardStats;
}

export const KPICards = ({ dashboardStats }: Props) => {
  const { setSelectedCity } = useCityContext();

  if (!dashboardStats) return null;

  const topCity = dashboardStats.top_cities.length > 0 ? dashboardStats.top_cities[0] : { city: 'N/A', crimes: 0 };
  const growth = dashboardStats.growth_pct;

  const stats = [
    {
      title: 'Jurisdictions Monitored',
      value: dashboardStats.total_cities.toString(),
      change: 'Active Map Regions',
      trend: 'neutral',
      icon: Building2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
    },
    {
      title: `Total Crimes (${dashboardStats.latest_year || 'Latest'})`,
      value: dashboardStats.total_crimes_latest.toLocaleString(),
      change: 'Aggregated DB metrics',
      trend: 'neutral',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: 'Highest Crime City',
      value: topCity.city,
      change: `${topCity.crimes.toLocaleString()} Cases Recorded`,
      trend: 'up',
      icon: MapPin,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
    },
    {
      title: 'National YoY Growth',
      value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
      change: `${growth > 0 ? 'Increase' : 'Decrease'} from previous yr`,
      trend: growth > 0 ? 'up' : 'down',
      icon: Activity,
      color: growth > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: growth > 0 ? 'bg-rose-400/10' : 'bg-emerald-400/10',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            onClick={() => {
              if (stat.title === 'Highest Crime City') setSelectedCity(stat.value);
            }}
            className={`group p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-slate-800/60 transition-all duration-500 shadow-xl hover:-translate-y-1 relative overflow-visible ${stat.title === 'Highest Crime City' ? 'cursor-pointer' : ''}`}
          >
            <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${stat.bg.replace('/10', '')}`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-inner`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border shadow-sm ${
                stat.trend === 'up' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                stat.trend === 'down' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                'bg-slate-800 text-slate-400 border-white/10'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <div className="relative z-10 flex-shrink-0 min-w-[120px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-3xl font-bold text-white tracking-tight drop-shadow-sm break-words truncate sm:whitespace-normal">{stat.value}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1.5 font-medium">{stat.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

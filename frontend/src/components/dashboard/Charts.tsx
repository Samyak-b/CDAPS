import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChoroplethData } from '../../hooks/useAnalytics';
import { useCityContext } from '../../contexts/CityContext';

interface Props {
  mapData: ChoroplethData[];
  topData: { city: string; crimes: number }[];
}

export const Charts = ({ mapData, topData }: Props) => {
  const { setSelectedCity } = useCityContext();
  
  // Extract and sort positive/negative shifts securely
  const growthData = [...mapData].sort((a, b) => b.pct_change - a.pct_change).filter(d => Math.abs(d.pct_change) > 0).slice(0, 12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* City Comparison Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-colors overflow-visible">
        <h3 className="text-lg font-semibold text-white mb-6">Top Cities by Crime Volume (2024)</h3>
        <div className="h-[300px] w-full min-w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="city" 
                stroke="#e2e8f0" 
                tick={{fill: '#e2e8f0', fontSize: 12}} 
                axisLine={false} 
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
                tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + "…" : value}
              />
              <YAxis stroke="#e2e8f0" tick={{fill: '#e2e8f0', fontSize: 12}} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{fill: '#ffffff05'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="crimes" name="Total Crimes" fill="#8b5cf6" radius={[4, 4, 0, 0]} onClick={(data) => { if(data && data.city) setSelectedCity(data.city); }} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-colors overflow-visible">
        <h3 className="text-lg font-semibold text-white mb-6">Largest YoY Shifts (%)</h3>
        <div className="h-[300px] w-full min-w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="city" 
                stroke="#e2e8f0" 
                tick={{fill: '#e2e8f0', fontSize: 10}} 
                axisLine={false} 
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
                tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + "…" : value}
              />
              <YAxis stroke="#e2e8f0" tick={{fill: '#e2e8f0', fontSize: 12}} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{fill: '#ffffff05'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '14px' }}
                formatter={(val) => [`${Number(val).toFixed(2)}%`, 'YoY Growth']}
              />
              <Bar dataKey="pct_change" radius={[4, 4, 0, 0]} onClick={(data) => { if(data && data.city) setSelectedCity(data.city); }} className="cursor-pointer">
                {growthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pct_change >= 0 ? '#ef4444' : '#22c55e'} /> 
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

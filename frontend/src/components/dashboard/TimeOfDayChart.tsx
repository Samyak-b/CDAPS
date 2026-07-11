import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeOfDayData } from '../../hooks/useAnalytics';
import { Clock, ShieldAlert } from 'lucide-react';

interface Props {
  timeData: TimeOfDayData[];
}

export const TimeOfDayChart = ({ timeData }: Props) => {
  // Take top 8 crime types to keep visual clutter low
  const chartData = React.useMemo(() => {
    return timeData.slice(0, 8);
  }, [timeData]);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-colors overflow-visible mt-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Diurnal Crime Density & Temporal Distribution</h3>
          <p className="text-xs text-slate-400 font-medium">Analyzing crime frequency cycles across distinct time-of-day slots</p>
        </div>
      </div>

      <div className="h-[380px] w-full min-w-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="crime" 
              stroke="#e2e8f0" 
              tick={{fill: '#e2e8f0', fontSize: 11}} 
              axisLine={false} 
              tickLine={false}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#e2e8f0" tick={{fill: '#e2e8f0', fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: '#ffffff05'}}
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontSize: '13px' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', fill: '#fff' }}
            />
            {/* Soft glowing stacked bars for time slots */}
            <Bar dataKey="Morning" stackId="t" fill="#f59e0b" name="Morning (04:00 - 12:00)" />
            <Bar dataKey="Afternoon" stackId="t" fill="#ea580c" name="Afternoon (12:00 - 17:00)" />
            <Bar dataKey="Evening" stackId="t" fill="#7c3aed" name="Evening (17:00 - 22:00)" />
            <Bar dataKey="Night" stackId="t" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Night (22:00 - 04:00)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
        {/* Left Column: Temporal Conclusions */}
        <div className="p-5 rounded-xl bg-slate-950/45 border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <span className="w-1.5 h-3 bg-purple-500 rounded-full" />
              <span>Temporal Trends & Conclusions</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold mt-0.5">•</span>
                <p>
                  <strong>Nighttime Vulnerability Cluster:</strong> Violent and personal crimes like <em>Homicide</em> (~60%), <em>Sexual Assault</em> (~52%), and <em>Assault</em> (~55%) heavily cluster during late night hours.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-400 font-bold mt-0.5">•</span>
                <p>
                  <strong>Daytime Property Target:</strong> Property offenses like <em>Burglary</em> show a distinct peak in the afternoon (12:00 - 17:00, ~48%), coinciding with standard office hours when residential properties are vacant.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 font-bold mt-0.5">•</span>
                <p>
                  <strong>Commute Commotion Index:</strong> Violations and public safety hazards show peaks during morning and evening rush hours, correlating with peak traffic density.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Patrol Optimization Decisions */}
        <div className="p-5 rounded-xl bg-slate-950/45 border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
              <span>Patrol & Deployment Decisions</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold mt-0.5">1.</span>
                <p>
                  <strong>Late Night Shift Reallocation:</strong> Shift 55% of active field patrolling officers to the Night shift (22:00 - 04:00), focusing specifically on entertainment sectors and vulnerable transit hubs.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold mt-0.5">2.</span>
                <p>
                  <strong>Business Hour Community Watch:</strong> Mobilize community wardens and civilian neighborhood checks in residential areas during the afternoon shift (12:00 - 17:00) to deter burglaries.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold mt-0.5">3.</span>
                <p>
                  <strong>Commute Speed & Safety Checks:</strong> Direct traffic control teams to establish speed and intoxication check points during the morning (08:00 - 10:00) and evening (17:00 - 19:00) peak rush windows.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

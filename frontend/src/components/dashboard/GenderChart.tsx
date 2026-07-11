import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GenderCrimeData } from '../../hooks/useAnalytics';
import { Info } from 'lucide-react';

interface Props {
  genderData: GenderCrimeData[];
}

export const GenderChart = ({ genderData }: Props) => {
  // Take top 8 crime types to keep visual clutter low
  const chartData = React.useMemo(() => {
    return genderData.slice(0, 8);
  }, [genderData]);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-colors overflow-visible mt-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Victim Gender Distribution by Crime Category</h3>
          <p className="text-xs text-slate-400 font-medium">Cross-referencing victim demographic classifications with specific offense types</p>
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
            {/* Soft glowing bars */}
            <Bar dataKey="Female" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} name="Female" />
            <Bar dataKey="Male" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Male" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-slate-950/30 border border-white/5 text-xs text-slate-300 leading-relaxed">
        <span className="font-bold text-indigo-400">Demographic Insight:</span>
        <p className="mt-1">
          The distribution shows significant variance based on the crime classification. For instance, violent personal crimes, gender-focused incidents, and property theft register highly skewed gender patterns, which is critical for law enforcement agencies when planning targeted prevention and social awareness initiatives.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
        {/* Left Column: Criminology Conclusions */}
        <div className="p-5 rounded-xl bg-slate-950/45 border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
              <span>Key Analytical Conclusions</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold mt-0.5">•</span>
                <p>
                  <strong>High Female Risk Profile:</strong> Violent personal crimes such as <em>Domestic Violence</em> and <em>Sexual Assault</em> show a major overrepresentation of female victims (~85%+). This highlights clear demographic targeting.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold mt-0.5">•</span>
                <p>
                  <strong>High Male Risk Profile:</strong> Street and property crimes such as <em>Assault</em>, <em>Public Intoxication</em>, and <em>Homicide</em> predominantly list male victims (~70%+), indicating a high correlation with nighttime public activity.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold mt-0.5">•</span>
                <p>
                  <strong>Balanced Risk Profile:</strong> Financial and digital crimes (<em>Cybercrime</em>, <em>Identity Theft</em>, and <em>Fraud</em>) show a highly uniform gender distribution (near 50/50), illustrating gender-blind targeting strategies by digital exploiters.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Policy Decisions */}
        <div className="p-5 rounded-xl bg-slate-950/45 border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <span className="w-1.5 h-3 bg-purple-500 rounded-full" />
              <span>Command Dispatch Decisions</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold mt-0.5">1.</span>
                <p>
                  <strong>Gender-Focused Outreach:</strong> Launch prioritized safety desks and safe zones in sectors reporting high Domestic Violence/Sexual Assault. Direct 40% of public distress response training toward women-centric safety beacons.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold mt-0.5">2.</span>
                <p>
                  <strong>Nightlife Hotspot Patrols:</strong> Deploy proactive police patrol dispatch in nightlife zones, entertainment blocks, and bars between 22:00 and 04:00 to mitigate street brawls and assault victimizations.
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold mt-0.5">3.</span>
                <p>
                  <strong>Universal Cyber Safety Campaigns:</strong> Since Cybercrime affects all genders equally, publish universal safety booklets and online authentication warning modules across all municipalities.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { 
  FileText, TrendingUp, TrendingDown, AlertTriangle, 
  Layers, Printer
} from 'lucide-react';
import { ChoroplethData } from '../../hooks/useAnalytics';

interface Props {
  mapData: ChoroplethData[];
  topData: { city: string; crimes: number }[];
}

export const CrimeReport = ({ mapData, topData }: Props) => {
  // Compute metrics
  const reportMetrics = useMemo(() => {
    if (!mapData || mapData.length === 0) return null;

    let total2023 = 0;
    let total2024 = 0;
    let highRiskCount = 0;
    let medHighRiskCount = 0;
    let medRiskCount = 0;
    let lowRiskCount = 0;

    mapData.forEach(cityData => {
      total2023 += cityData.crimes_prev || 0;
      total2024 += cityData.crimes_curr || 0;

      const crimes = cityData.crimes_curr || 0;
      if (crimes > 1000) highRiskCount++;
      else if (crimes > 500) medHighRiskCount++;
      else if (crimes > 200) medRiskCount++;
      else lowRiskCount++;
    });

    const netChange = total2024 - total2023;
    const overallPctChange = total2023 > 0 ? (netChange / total2023) * 100 : 0;
    const avgCrimes2024 = total2024 / mapData.length;

    // Escalating cities (largest positive YoY shift)
    const escalating = [...mapData]
      .filter(c => c.pct_change > 0)
      .sort((a, b) => b.pct_change - a.pct_change)
      .slice(0, 3);

    // Improving cities (largest negative YoY shift)
    const improving = [...mapData]
      .filter(c => c.pct_change < 0)
      .sort((a, b) => a.pct_change - b.pct_change)
      .slice(0, 3);

    return {
      total2023,
      total2024,
      netChange,
      overallPctChange,
      avgCrimes2024,
      highRiskCount,
      medHighRiskCount,
      medRiskCount,
      lowRiskCount,
      escalating,
      improving,
      totalCities: mapData.length
    };
  }, [mapData]);

  if (!reportMetrics) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    total2023,
    total2024,
    netChange,
    overallPctChange,
    avgCrimes2024,
    highRiskCount,
    medHighRiskCount,
    medRiskCount,
    lowRiskCount,
    escalating,
    improving,
    totalCities
  } = reportMetrics;

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-colors overflow-hidden mt-8 print:bg-white print:text-black print:border-none print:shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-6 mb-6 gap-4 print:border-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 print:hidden">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white print:text-slate-900">Executive Dataset Analysis & Report</h3>
            <p className="text-xs text-slate-400 font-medium print:text-slate-500">Automated high-level diagnostics of the current crime database</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between print:bg-slate-100 print:border-slate-300 print:text-black">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider print:text-slate-600">YoY Crime Volume Shift</span>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-white print:text-slate-900">
              {netChange > 0 ? `+${netChange.toLocaleString()}` : netChange.toLocaleString()}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallPctChange > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 print:text-red-600' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:text-green-600'}`}>
              {overallPctChange > 0 ? '↑' : '↓'} {Math.abs(overallPctChange).toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed print:text-slate-600">
            Comparative analysis of cases in 2024 ({total2024.toLocaleString()}) against 2023 ({total2023.toLocaleString()}) across all tracked cities.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between print:bg-slate-100 print:border-slate-300 print:text-black">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider print:text-slate-600">Average Cases Per City</span>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold text-white print:text-slate-900">
              {Math.round(avgCrimes2024).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-2 print:text-slate-600">cases / city</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed print:text-slate-600">
            The dataset spans {totalCities} total cities, illustrating a diverse geographic representation from high-density hubs to smaller municipalities.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between print:bg-slate-100 print:border-slate-300 print:text-black">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider print:text-slate-600">Critical Risk Areas</span>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-rose-400 print:text-red-600">{highRiskCount}</span>
            <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider print:text-red-600">High Risk</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed print:text-slate-600">
            Jurisdictions currently registering above 1,000 yearly offenses, highlighting locations needing strategic deployment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2">
        {/* Left Section: Key Shifts */}
        <div className="space-y-6">
          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-slate-300 mb-3 flex items-center space-x-2 print:text-slate-900">
              <TrendingUp className="w-4 h-4 text-rose-400 print:hidden" />
              <span>Highest YoY Escalations</span>
            </h4>
            <div className="space-y-3">
              {escalating.length > 0 ? (
                escalating.map((city, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/20 border border-rose-500/10 flex items-center justify-between hover:bg-slate-950/30 transition-colors print:bg-slate-50 print:border-slate-300 print:text-black">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-xs print:bg-red-100 print:text-red-600">
                        #{idx + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-white print:text-slate-900">{city.city}</h5>
                        <span className="text-xs text-slate-400 font-medium print:text-slate-500">
                          {city.crimes_prev} cases → {city.crimes_curr} cases
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-400 print:text-red-600">+{city.pct_change.toFixed(1)}%</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider print:text-slate-600">Increase</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/10 border border-emerald-500/10 flex items-center space-x-3 text-slate-300 print:bg-slate-50 print:border-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm print:bg-green-100 print:text-green-600">✓</div>
                  <div>
                    <h5 className="text-sm font-semibold text-white print:text-slate-900">No Escalating Nodes</h5>
                    <span className="text-xs text-slate-400 font-medium print:text-slate-500">All cities registered YoY reductions.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-slate-300 mb-3 flex items-center space-x-2 print:text-slate-900">
              <TrendingDown className="w-4 h-4 text-emerald-400 print:hidden" />
              <span>Highest YoY Improvements</span>
            </h4>
            <div className="space-y-3">
              {improving.map((city, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/20 border border-emerald-500/10 flex items-center justify-between hover:bg-slate-950/30 transition-colors print:bg-slate-50 print:border-slate-300 print:text-black">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs print:bg-green-100 print:text-green-600">
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="text-sm font-semibold text-white print:text-slate-900">{city.city}</h5>
                      <span className="text-xs text-slate-400 font-medium print:text-slate-500">
                        {city.crimes_prev} cases → {city.crimes_curr} cases
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 print:text-green-600">{city.pct_change.toFixed(1)}%</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider print:text-slate-600">Reduction</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Risk Distribution Summary */}
        <div className="p-6 rounded-2xl bg-slate-950/35 border border-white/5 flex flex-col justify-between space-y-6 print:bg-slate-50 print:border-slate-300">
          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-slate-300 mb-4 flex items-center space-x-2 print:text-slate-900">
              <Layers className="w-4 h-4 text-purple-400 print:hidden" />
              <span>Safety & Risk Classification Spectrum</span>
            </h4>
            <div className="space-y-3.5">
              {/* High Risk */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold print:text-black">
                  <span className="text-rose-400 print:text-red-600">High Risk (&gt;1k cases)</span>
                  <span className="text-slate-300 print:text-slate-800">{highRiskCount} {highRiskCount === 1 ? 'city' : 'cities'} ({Math.round((highRiskCount/totalCities)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 print:bg-slate-200">
                  <div className="bg-rose-500 h-2 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] print:bg-red-500" style={{ width: `${(highRiskCount/totalCities)*100}%` }}></div>
                </div>
              </div>

              {/* Med-High Risk */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold print:text-black">
                  <span className="text-orange-400 print:text-orange-600">Med-High Risk (500 - 1k)</span>
                  <span className="text-slate-300 print:text-slate-800">{medHighRiskCount} {medHighRiskCount === 1 ? 'city' : 'cities'} ({Math.round((medHighRiskCount/totalCities)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 print:bg-slate-200">
                  <div className="bg-orange-500 h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)] print:bg-orange-500" style={{ width: `${(medHighRiskCount/totalCities)*100}%` }}></div>
                </div>
              </div>

              {/* Medium Risk */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold print:text-black">
                  <span className="text-yellow-400 print:text-yellow-600">Medium Risk (200 - 500)</span>
                  <span className="text-slate-300 print:text-slate-800">{medRiskCount} {medRiskCount === 1 ? 'city' : 'cities'} ({Math.round((medRiskCount/totalCities)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 print:bg-slate-200">
                  <div className="bg-yellow-500 h-2 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] print:bg-yellow-500" style={{ width: `${(medRiskCount/totalCities)*100}%` }}></div>
                </div>
              </div>

              {/* Low Risk */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold print:text-black">
                  <span className="text-emerald-400 print:text-green-600">Low Risk (≤ 200 cases)</span>
                  <span className="text-slate-300 print:text-slate-800">{lowRiskCount} {lowRiskCount === 1 ? 'city' : 'cities'} ({Math.round((lowRiskCount/totalCities)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 print:bg-slate-200">
                  <div className="bg-emerald-500 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] print:bg-green-500" style={{ width: `${(lowRiskCount/totalCities)*100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-300 space-y-2 leading-relaxed print:bg-white print:border-slate-300 print:text-slate-800">
            <span className="font-bold flex items-center space-x-1.5 text-purple-400 print:text-purple-700">
              <AlertTriangle className="w-3.5 h-3.5 print:hidden" />
              <span>Data-Driven Takeaway:</span>
            </span>
            <p>
              {overallPctChange > 0 ? (
                <>
                  The overall crime volume is showing an upward trajectory of +{overallPctChange.toFixed(2)}% compared to last year. Priority resource distribution and patrol dispatch should focus on escalating nodes, notably{' '}
                  <span className="font-bold text-white print:text-black">{escalating.map(c => c.city).join(', ')}</span>, where YoY spikes are registered.{' '}
                </>
              ) : escalating.length > 0 ? (
                <>
                  A positive downward trajectory of {Math.abs(overallPctChange).toFixed(2)}% is recorded nationally. However, attention is required at escalating nodes like{' '}
                  <span className="font-bold text-white print:text-black">{escalating.map(c => c.city).join(', ')}</span>, where YoY spikes are registered.{' '}
                </>
              ) : (
                <>
                  A positive downward trajectory of {Math.abs(overallPctChange).toFixed(2)}% is recorded nationally. All tracked jurisdictions registered a positive YoY reduction, with no escalating crime nodes detected this period.{' '}
                </>
              )}
              Conversely, positive crime reduction trends in <span className="font-bold text-white print:text-black">{improving.map(c => c.city).join(', ')}</span> provide benchmarks for successful safety initiatives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

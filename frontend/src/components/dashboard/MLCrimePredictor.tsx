import React, { useState } from 'react';
import { useCityList } from '../../hooks/useAnalytics';
import { fetchPredictions } from '../../lib/api';
import { Brain, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const MLCrimePredictor = () => {
  const { data: cities } = useCityList();
  const [selectedCity, setSelectedCity] = useState('');
  const [months, setMonths] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<{ label: string; value: number }[]>([]);
  const [modelUsed, setModelUsed] = useState('');
  const [searched, setSearched] = useState(false);

  const handlePredict = async () => {
    if (!selectedCity) {
      toast.error('Please select a city.');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      const resp = await fetchPredictions(selectedCity, months);
      let resgroups: { label: string; value: number }[] = [];
      
      setModelUsed(resp.model || 'Random Forest Ensemble');

      if (resp.predictions) {
        const grouped: Record<string, number> = {};
        resp.predictions.forEach((p: any) => {
          const grp = p.crime_group || p.crime || 'UNKNOWN';
          const val = Number(p.crime_count ?? p.predicted_count ?? p.predicted ?? 0);
          grouped[grp] = (grouped[grp] || 0) + val;
        });
        resgroups = Object.keys(grouped).map(k => ({
          label: k,
          value: Math.round(grouped[k])
        }));
      } else if (resp.results) {
        resgroups = resp.results.map((r: any) => ({
          label: r.crime_group || 'UNKNOWN',
          value: Math.round(r.predictions?.reduce((acc: number, curr: any) => acc + (curr.predicted_count || 0), 0) || 0)
        }));
      }

      // Filter out generic and unspecified categories for specific decision-making
      resgroups = resgroups.filter(item => {
        const labelLower = item.label.toLowerCase().trim();
        return labelLower !== 'other crime' && labelLower !== 'unknown' && labelLower !== 'other';
      });

      // Sort descending by predicted count
      resgroups.sort((a, b) => b.value - a.value);
      setPredictions(resgroups);
    } catch (error: any) {
      toast.error('Prediction failed: ' + (error.message || error));
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const highestRiskCrime = predictions[0];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl hover:border-white/10 transition-colors mt-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Machine Learning Crime Type Predictor</h3>
          <p className="text-xs text-slate-400 font-medium">Predicting specific crime classification categories using Random Forest & XGBoost pipelines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* City Select */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target City</label>
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">-- Select target city --</option>
            {cities?.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Months ahead */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Forecast Horizon (Months)</label>
          <input 
            type="number" 
            min="1" 
            max="36" 
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            placeholder="e.g. 6"
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handlePredict}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm tracking-wide transition-all shadow hover:shadow-purple-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running ML Pipeline...</span>
              </>
            ) : (
              <>
                <span>Generate Forecast</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {searched && !isLoading && predictions.length > 0 && (
        <div className="mt-6 border-t border-white/5 pt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ensemble Model Used: <span className="text-purple-400 font-mono font-normal">{modelUsed.toUpperCase()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Predicted Categories */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Predicted Crime Category Distribution</h4>
              <div className="space-y-3">
                {predictions.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{p.label}</span>
                      <span className="text-slate-400 font-mono">{p.value} cases ({idx === 0 ? 'Highest Threat' : 'Tracked'})</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5">
                      <div 
                        className={`h-1.5 rounded-full ${idx === 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-purple-500'}`} 
                        style={{ width: `${Math.min(100, (p.value / (highestRiskCrime?.value || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Advice */}
            <div className="p-5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Threat Intelligence Mitigation Directive</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on the machine learning ensemble forecast, <span className="font-bold text-rose-400">{highestRiskCrime?.label}</span> represents the highest predicted volume (<span className="font-bold text-white font-mono">{highestRiskCrime?.value} cases</span>) in <span className="font-bold text-white">{selectedCity}</span> for the next {months} months.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Recommended Action:</strong> Deploy high-visibility patrol units and coordinate localized wardens to establish protective presence in commercial blocks, nightlife zones, and transit centers during high-incidence hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

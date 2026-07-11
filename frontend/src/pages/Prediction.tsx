import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useCityList } from '../hooks/useAnalytics';
import { MLCrimePredictor } from '../components/dashboard/MLCrimePredictor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Send, Activity, Info, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../config/api';

const Prediction = () => {
  const { data: cities } = useCityList();
  const [selectedCity, setSelectedCity] = useState('');
  const [months, setMonths] = useState<number>(6);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    if (months < 1 || months > 12) return;
    
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      let res = await fetch(`${API_BASE}/predict-sarima`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: selectedCity, months: months })
      });
      
      let data = await res.json();
      
      if (!res.ok || data.detail || data.error) {
        // Fallback
        res = await fetch(`${API_BASE}/predict?city=${encodeURIComponent(selectedCity)}&months_ahead=${months}`);
        data = await res.json();
        
        if (!res.ok || data.error) {
           setError("No prediction model available for this city");
           setIsLoading(false);
           return;
        }
        
        // Handle fallback structure
        if (data.predictions && Array.isArray(data.predictions)) {
          setPrediction({
            dates: data.predictions.map((p: any) => p.year_month),
            values: data.predictions.map((p: any) => p.predicted_count)
          });
        } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const firstGroup = data.results[0].predictions;
          setPrediction({
            dates: firstGroup.map((p: any) => p.year_month),
            values: firstGroup.map((p: any) => p.predicted_count)
          });
        } else {
          setError("No prediction model available for this city");
        }
      } else {
        setPrediction(data);
      }
    } catch (err) {
      setError("No prediction model available for this city");
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = prediction ? prediction.dates.map((dateStr: string, index: number) => ({
    name: new Date(dateStr).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
    forecast: Number(prediction.values[index].toFixed(0))
  })) : [];

  return (
    <div className="flex h-screen bg-slate-950 font-sans selection:bg-purple-500/30 overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out py-4">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Crime Forecasting</h1>
                <p className="text-slate-400 mt-1.5 text-sm font-medium">SARIMA modeling utilized for forecasting future crime trends.</p>
              </div>
            </div>

            {/* Input Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl">
              <form onSubmit={predict} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 ml-1">Select Jurisdiction</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none shadow-inner"
                    required
                  >
                    <option value="" disabled>-- Choose a City --</option>
                    {cities?.map((city: string) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full md:w-[150px] space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 ml-1">Months Ahead</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !selectedCity}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg flex items-center justify-center min-w-[160px]"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Run Forecast</>
                  )}
                </button>
              </form>
            </div>

            {/* Output Panel */}
            {prediction && chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl overflow-visible">
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                       <div className="p-2 rounded-lg bg-purple-500/10">
                         <Activity className="w-5 h-5 text-purple-400" />
                       </div>
                       <h3 className="text-lg font-semibold text-white">{months}-Month Trend Curve: {selectedCity}</h3>
                    </div>
                  </div>
                  
                  <div className="h-[350px] w-full min-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="name" 
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
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontWeight: 600 }}
                          labelStyle={{ color: '#e2e8f0', marginBottom: '4px' }}
                        />
                        <Line type="monotone" dataKey="forecast" name="Predicted Cases" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#0f172a'}} activeDot={{r: 6, strokeWidth: 0, fill: '#c084fc'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-xl flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                     <div className="p-2 rounded-lg bg-indigo-500/10">
                       <Info className="w-5 h-5 text-indigo-400" />
                     </div>
                     <h3 className="text-lg font-semibold text-white">Forecast Values</h3>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {chartData.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-white/5">
                        <span className="text-slate-300 font-medium text-sm">{d.name}</span>
                        <span className="text-indigo-300 font-mono font-bold">{d.forecast}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center mt-6">
                <AlertTriangle className="w-5 h-5 mr-3" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            {/* Machine Learning Crime Type Predictor */}
            <MLCrimePredictor />

          </div>
        </main>
      </div>
    </div>
  );
};

export default Prediction;

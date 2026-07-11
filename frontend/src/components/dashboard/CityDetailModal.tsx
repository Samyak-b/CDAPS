import React, { useEffect, useState } from 'react';
import { useCityContext } from '../../contexts/CityContext';
import { X, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const CityDetailModal = () => {
  const { isModalOpen, setIsModalOpen, selectedCity } = useCityContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [years, setYears] = useState<number[]>([]);
  const [yearPrev, setYearPrev] = useState<number | null>(null);
  const [yearCurr, setYearCurr] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("http://127.0.0.1:8080/years")
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.years) {
          setYears(data.years);
          if (data.years.length >= 2) {
            setYearPrev(data.years[data.years.length - 2]);
            setYearCurr(data.years[data.years.length - 1]);
          }
        }
      })
      .catch(console.error);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCityData = async () => {
      if (!selectedCity || !isModalOpen || !yearPrev || !yearCurr) return;
      if (yearPrev >= yearCurr) return; // Wait for valid pair interaction
      
      setLoading(true);
      setError(null);
      setStats(null);
      
      try {
        const { data: statsData } = await api.get(`/stats/city?city=${selectedCity}&year_prev=${yearPrev}&year_curr=${yearCurr}`);
        if (isMounted) {
           setStats(statsData);
           setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
           console.error('Error fetching city details:', err);
           setError(err?.response?.data?.detail || err.message || 'Failed to fetch city details');
           setLoading(false);
        }
      }
    };

    fetchCityData();
    return () => { isMounted = false; };
  }, [selectedCity, isModalOpen, yearPrev, yearCurr]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-visible">
      <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-2xl w-[90%] sm:w-[400px] max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/50">
          <h2 className="text-xl font-bold text-white tracking-tight break-words pr-4">{selectedCity} Analysis</h2>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-400 text-sm mb-3">
            Select years to compare crime data
          </p>
          <div className="flex gap-3 mb-6">
            <select
              value={yearPrev || ""}
              onChange={(e) => setYearPrev(Number(e.target.value))}
              className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 flex-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="flex items-center justify-center -mx-1">
              <span className="text-slate-500 font-bold">→</span>
            </div>
            <select
              value={yearCurr || ""}
              onChange={(e) => setYearCurr(Number(e.target.value))}
              className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 flex-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {yearPrev !== null && yearCurr !== null && yearPrev >= yearCurr ? (
             <div className="flex flex-col items-center justify-center p-4 text-center space-y-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
               <AlertTriangle className="w-8 h-8 text-amber-400" />
               <p className="text-amber-200 font-medium text-sm">Comparison requires chronologically ordered years. Please select an ending year greater than the starting year.</p>
             </div>
          ) : loading ? (
             <div className="flex flex-col items-center justify-center h-48 space-y-4">
               <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
               <p className="text-slate-400 text-sm">Aggregating jurisdiction data...</p>
             </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-48 p-4 text-center space-y-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
               <AlertTriangle className="w-8 h-8 text-rose-400" />
               <p className="text-rose-200 font-medium text-sm">{error}</p>
             </div>
          ) : stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner flex-shrink-0 min-w-[120px]">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Previous Year ({stats.year_prev})</p>
                    <p className="text-3xl font-mono text-white tracking-tight break-words">{stats.crimes_prev}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner flex-shrink-0 min-w-[120px]">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Current Year ({stats.year_curr})</p>
                    <p className="text-3xl font-mono text-white tracking-tight break-words">{stats.crimes_curr}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border shadow-lg overflow-visible ${stats.pct_change > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-2">YoY Change Calculation</p>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className={`w-6 h-6 ${stats.pct_change > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <p className={`text-3xl font-bold ${stats.pct_change > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {stats.pct_change > 0 ? '+' : ''}{Number(stats.pct_change).toFixed(2)}%
                    </p>
                  </div>
                </div>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48">
               <p className="text-slate-400 text-sm">No data available.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

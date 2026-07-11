import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MapComponent } from '../components/map/MapComponent';
import { useChoropleth, useCityStats, useCityList } from '../hooks/useAnalytics';
import { useCityContext } from '../contexts/CityContext';
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react';

const MapView = () => {
  const { data: mapData, isLoading: mapLoading } = useChoropleth();
  const { data: cities } = useCityList();
  
  const { selectedCity, setSelectedCity } = useCityContext();
  const { data: cityStats, isLoading: statsLoading } = useCityStats(selectedCity);

  if (mapLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col md:flex-row gap-6 relative">
          
          <div className="flex-1 flex flex-col bg-slate-900/60 rounded-2xl border border-white/5 shadow-xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur border border-white/10 rounded-xl p-3 shadow-2xl w-72">
               <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Search Jurisdiction</h3>
               <div className="relative">
                  <select 
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none shadow-inner"
                  >
                    <option value="" disabled>-- Select a City --</option>
                    {cities?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
               </div>
            </div>
            
            <MapComponent data={mapData} onCityClick={setSelectedCity} searchedCity={selectedCity} validCities={cities || []} />
          </div>

          {/* Details Panel Side */}
          {selectedCity && (
            <div className="w-full md:w-80 bg-slate-900/80 rounded-2xl border border-white/5 shadow-xl p-6 flex flex-col animate-in slide-in-from-right-8 duration-300">
               <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">{selectedCity}</h2>
               
               {statsLoading ? (
                 <div className="flex justify-center items-center h-32">
                   <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                 </div>
               ) : cityStats ? (
                 <div className="space-y-6">
                   <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner">
                     <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Previous 2023 Cases</p>
                     <p className="text-3xl font-mono text-white tracking-tight">{cityStats.crimes_prev}</p>
                   </div>
                   
                   <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner">
                     <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Current 2024 Cases</p>
                     <p className="text-3xl font-mono text-white tracking-tight">{cityStats.crimes_curr}</p>
                   </div>

                   <div className={`p-4 rounded-xl border shadow-lg ${cityStats.pct_change > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                     <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-2">YoY Change Calculation</p>
                     <div className="flex items-center space-x-3">
                        <TrendingUp className={`w-6 h-6 ${cityStats.pct_change > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                        <p className={`text-3xl font-bold ${cityStats.pct_change > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {cityStats.pct_change > 0 ? '+' : ''}{Number(cityStats.pct_change).toFixed(2)}%
                        </p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center text-rose-400 space-x-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                   <AlertTriangle className="w-5 h-5" />
                   <span className="text-sm font-medium">Failed to retrieve precise live details for {selectedCity}.</span>
                 </div>
               )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MapView;

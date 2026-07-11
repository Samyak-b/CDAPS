import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useCityContext } from '../../contexts/CityContext';
import { useCityList } from '../../hooks/useAnalytics';

export const Header = () => {
  const { setSelectedCity } = useCityContext();
  const { data: cityList } = useCityList();
  
  const [query, setQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query) {
      setFilteredCities([]);
      setIsDropdownOpen(false);
    } else if (cityList) {
      const filtered = cityList.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCities(filtered);
      setIsDropdownOpen(true);
    }
  }, [query, cityList]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCity = (city: string) => {
    setQuery("");
    setIsDropdownOpen(false);
    setSelectedCity(city);
  };

  return (
    <header className="h-[72px] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex-1 max-w-xl flex items-center">
        <button className="md:hidden mr-4 text-slate-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full" ref={searchRef}>
          <div className="relative group w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if(query) setIsDropdownOpen(true); }}
              placeholder="Search cities..." 
              className="w-full bg-slate-900/50 border border-white/5 text-slate-200 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-400 shadow-inner"
            />
          </div>
          
          {/* Autocomplete Dropdown */}
          {isDropdownOpen && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              {filteredCities.map(city => (
                <div 
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className="px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors text-sm border-b border-slate-800/50 last:border-0"
                >
                  {city}
                </div>
              ))}
            </div>
          )}
          
          {isDropdownOpen && query && filteredCities.length === 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 p-4 text-center">
              <p className="text-slate-400 text-sm">No cities found matching "{query}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6 ml-4">
        <button className="relative text-slate-500 hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-white/10 pl-6 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Administrator</p>
            <p className="text-[10px] text-purple-400 font-medium tracking-wider uppercase">System Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};

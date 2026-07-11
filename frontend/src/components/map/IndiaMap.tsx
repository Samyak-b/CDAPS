import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';

const cities = {
  Pune: { lat: 18.5204, lng: 73.8567, crimeIndex: 72 },
  Mumbai: { lat: 19.0760, lng: 72.8777, crimeIndex: 85 },
  Delhi: { lat: 28.7041, lng: 77.1025, crimeIndex: 90 },
  Bangalore: { lat: 12.9716, lng: 77.5946, crimeIndex: 65 },
  Chennai: { lat: 13.0827, lng: 80.2707, crimeIndex: 55 },
  Hyderabad: { lat: 17.3850, lng: 78.4867, crimeIndex: 45 },
  Kolkata: { lat: 22.5726, lng: 88.3639, crimeIndex: 80 }
};

const getColor = (index: number) => {
  if (index >= 80) return '#ef4444'; // Red (High)
  if (index >= 60) return '#eab308'; // Yellow (Medium)
  return '#10b981'; // Green (Low)
};

const getStatus = (index: number) => {
  if (index >= 80) return 'Dangerous';
  if (index >= 60) return 'Moderate';
  return 'Safe';
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.5
    });
  }, [center, zoom, map]);
  return null;
}

export const IndiaMap = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCity, setSearchedCity] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cityKey = Object.keys(cities).find(c => c.toLowerCase() === searchTerm.toLowerCase());
    if (cityKey) {
      setSearchedCity(cityKey);
    } else {
      setSearchedCity(null); // reset if not found
    }
  };

  const center: [number, number] = searchedCity 
    ? [cities[searchedCity as keyof typeof cities].lat, cities[searchedCity as keyof typeof cities].lng] 
    : [22.5937, 78.9629]; // Geographic center of India
  
  const zoom = searchedCity ? 10 : 4;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl hover:border-white/10 transition-colors overflow-hidden group">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/40 z-10 transition-colors group-hover:bg-slate-950/60">
        <h3 className="text-lg font-semibold text-white">Geospatial Crime Analysis</h3>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city..."
            className="bg-slate-900 border border-white/10 text-slate-200 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 w-48 shadow-inner"
          />
        </form>
      </div>
      
      <div className="flex-1 relative z-0 min-h-[400px]">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={false} 
          className="w-full h-full"
          style={{ background: '#020617' }} // slate-950
        >
          <ChangeView center={center} zoom={zoom} />
          {/* Using CartoDB Dark Matter for the dark theme premium look */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {Object.entries(cities).map(([name, data]) => {
            const isTarget = searchedCity === name;
            return (
              <CircleMarker
                key={name}
                center={[data.lat, data.lng]}
                radius={isTarget ? 30 : 15}
                pathOptions={{
                  fillColor: getColor(data.crimeIndex),
                  fillOpacity: isTarget ? 0.6 : 0.4,
                  color: getColor(data.crimeIndex),
                  weight: isTarget ? 3 : 1
                }}
              >
                <Popup className="premium-popup">
                  <div className="p-1 min-w-[140px]">
                    <h4 className="font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">{name}</h4>
                    <div className="flex justify-between items-center text-sm mb-1 mt-2">
                      <span className="text-slate-600 font-medium">Index:</span>
                      <span className="font-mono font-bold text-slate-800">{data.crimeIndex}/100</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Status:</span>
                      <span className="font-bold tracking-wide" style={{ color: getColor(data.crimeIndex) }}>
                        {getStatus(data.crimeIndex)}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  );
};

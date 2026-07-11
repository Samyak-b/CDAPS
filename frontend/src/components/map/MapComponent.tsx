import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getColor = (value: number) => {
  if (value > 1000) return "#ff0000";      // High (Red)
  if (value > 500) return "#ff7a00";       // Medium-High (Orange)
  if (value > 200) return "#ffd700";       // Medium (Yellow)
  return "#00ff88";                        // Low (Green)
};

const getRadius = (value: number) => {
  return Math.min(25, Math.max(8, value / 50));
};

const getCenter = (geometry: any): [number, number] | null => {
  if (geometry.type === "Polygon") {
    const coords = geometry.coordinates[0]; // outer ring

    let latSum = 0;
    let lngSum = 0;

    coords.forEach(([lng, lat]: [number, number]) => {
      latSum += lat;
      lngSum += lng;
    });

    return [
      latSum / coords.length,
      lngSum / coords.length
    ];
  } else if (geometry.type === "MultiPolygon") {
    // Added safety for multi-islands
    const coords = geometry.coordinates[0][0]; 
    let latSum = 0;
    let lngSum = 0;
    coords.forEach(([lng, lat]: [number, number]) => {
      latSum += lat;
      lngSum += lng;
    });
    return [latSum / coords.length, lngSum / coords.length];
  }

  return null;
};

const MapController = ({ searchedCity, data }: any) => {
  const map = useMap();

  useEffect(() => {
    if (!searchedCity || !data?.features) {
      if (!searchedCity) {
        map.flyTo([22.9734, 78.6569], 5, { duration: 1.5 });
      }
      return;
    }

    const feature = data.features.find(
      (f: any) => f.properties.city === searchedCity
    );

    if (!feature) return;

    const center = getCenter(feature.geometry);
    if (!center || isNaN(center[0]) || isNaN(center[1])) return;

    map.flyTo(center, 8, {
      duration: 1.5
    });
  }, [searchedCity, data, map]);

  return null;
};

const CityMarker = ({ feature, isSelected, onCityClick }: any) => {
  const markerRef = useRef<any>(null);
  const { city, crimes_curr } = feature.properties;
  const center = getCenter(feature.geometry);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  if (!center || isNaN(center[0]) || isNaN(center[1])) return null;

  return (
    <CircleMarker
      ref={markerRef}
      center={center}
      radius={isSelected ? 20 : getRadius(crimes_curr)}
      pathOptions={{
        color: isSelected ? "#00ffff" : getColor(crimes_curr),
        fillColor: isSelected ? "#00ffff" : getColor(crimes_curr),
        fillOpacity: isSelected ? 1 : 0.7,
        weight: isSelected ? 2 : 1
      }}
      eventHandlers={{
        click: () => onCityClick(city),
        mouseover: (e) => {
          e.target.setStyle({ weight: 2, fillOpacity: 1 });
        },
        mouseout: (e) => {
          e.target.setStyle({ 
            weight: isSelected ? 2 : 1, 
            fillOpacity: isSelected ? 1 : 0.7 
          });
        }
      }}
    >
      <Popup>
        <div>
          <strong className="text-slate-900">{city}</strong><br />
          <span className="text-slate-700">Crimes: {crimes_curr}</span>
        </div>
      </Popup>
    </CircleMarker>
  );
};

export const MapComponent = ({ 
  data, 
  onCityClick, 
  searchedCity,
  validCities
}: { 
  data: any, 
  onCityClick: (city: string) => void,
  searchedCity: string | null,
  validCities: string[]
}) => {
  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={[22.9734, 78.6569]} 
        zoom={5} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0" 
        style={{ background: '#020617' }}
      >
        <MapController searchedCity={searchedCity} data={data} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {data.features.map((feature: any, idx: number) => (
          <CityMarker 
            key={idx} 
            feature={feature} 
            isSelected={feature.properties.city === searchedCity} 
            onCityClick={onCityClick} 
          />
        ))}
      </MapContainer>

      {/* Risk Level Legend */}
      <div className="absolute bottom-6 right-6 z-[400] bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-slate-200 min-w-[210px]">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">Crime Risk Levels</h4>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff0000] shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 w-12">High</span>
            <span className="text-xs text-slate-400 font-medium">(&gt; 1,000 cases)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff7a00] shadow-[0_0_8px_rgba(255,122,0,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 w-12">Med-High</span>
            <span className="text-xs text-slate-400 font-medium">(500 - 1,000)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400 w-12">Medium</span>
            <span className="text-xs text-slate-400 font-medium">(200 - 500)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 w-12">Low</span>
            <span className="text-xs text-slate-400 font-medium">(≤ 200 cases)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

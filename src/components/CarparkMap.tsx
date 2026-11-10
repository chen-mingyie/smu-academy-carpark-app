import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark } from '../types/carpark';
import { Navigation, Zap, Bookmark, Star, ExternalLink, Maximize2 } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  All: { lat: 1.3521, lng: 103.8198, zoom: 12 },
  Orchard: { lat: 1.3025, lng: 103.8370, zoom: 15 },
  CBD: { lat: 1.2840, lng: 103.8520, zoom: 14 },
  East: { lat: 1.3520, lng: 103.9500, zoom: 13 },
  West: { lat: 1.3350, lng: 103.7350, zoom: 13 },
  North: { lat: 1.4320, lng: 103.7950, zoom: 13 },
};

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  isFavorite,
  onToggleFavorite,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8250], // Singapore central coordinates
      zoom: 12,
      zoomControl: true,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: [
        [1.15, 103.58], // Southwest bound
        [1.48, 104.08], // Northeast bound
      ],
    });

    // Dark cartographic tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever carparks change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear removed markers
    const currentIds = new Set(carparks.map((c) => c.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    carparks.forEach((carpark) => {
      const { lat, lng } = carpark.coordinates;
      const ratio = carpark.totalLots > 0 ? carpark.availableLots / carpark.totalLots : 0;

      // Color tier calculation
      let bgColor = 'bg-emerald-600';
      let borderColor = 'border-emerald-300';
      let textColor = 'text-white';
      let statusLabel = 'Available';

      if (carpark.availableLots <= 5 || ratio < 0.05) {
        bgColor = 'bg-rose-600';
        borderColor = 'border-rose-300';
        statusLabel = 'Almost Full';
      } else if (carpark.availableLots <= 35 || ratio < 0.2) {
        bgColor = 'bg-amber-500';
        borderColor = 'border-amber-200';
        statusLabel = 'Filling Fast';
      }

      const hasEv = carpark.evChargers && carpark.evChargers.available > 0;
      const isFav = isFavorite(carpark.id);

      // Custom DivIcon with live lot count and indicator
      const customIcon = L.divIcon({
        className: 'custom-lot-marker',
        html: `
          <div class="flex flex-col items-center cursor-pointer select-none">
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-lg border ${bgColor} ${borderColor} ${textColor} text-xs font-mono font-bold tabular-nums">
              ${hasEv ? '<span class="text-amber-200 text-[10px]">⚡</span>' : ''}
              <span>${carpark.availableLots}</span>
            </div>
            <div class="w-1.5 h-1.5 rounded-full ${bgColor} border border-white mt-0.5"></div>
          </div>
        `,
        iconSize: [44, 30],
        iconAnchor: [22, 28],
        popupAnchor: [0, -28],
      });

      let marker = markersRef.current.get(carpark.id);

      if (!marker) {
        marker = L.marker([lat, lng], { icon: customIcon });
        marker.addTo(map);

        marker.on('click', () => {
          onSelectCarpark(carpark);
        });

        markersRef.current.set(carpark.id, marker);
      } else {
        marker.setIcon(customIcon);
        marker.setLatLng([lat, lng]);
      }

      // Popup Content
      const popupHtml = `
        <div class="p-3 text-slate-100 max-w-[280px]">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="font-semibold text-sm text-white">${carpark.name}</div>
            <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              ${carpark.operator.replace('_', ' ')}
            </span>
          </div>
          <div class="text-xs text-slate-300 mb-2">
            ${carpark.address} (${carpark.postalCode})
          </div>
          
          <div class="grid grid-cols-2 gap-2 p-2 bg-slate-900 rounded-lg mb-2 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px]">Available Lots</span>
              <span class="font-mono font-bold text-sm ${ratio < 0.1 ? 'text-rose-400' : 'text-emerald-400'}">
                ${carpark.availableLots} <span class="text-xs text-slate-400 font-normal">/ ${carpark.totalLots}</span>
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">Day Rate (Est)</span>
              <span class="font-mono font-semibold text-slate-200">
                $${carpark.rates.baseHourlyRate.toFixed(2)}/hr
              </span>
            </div>
          </div>

          ${
            carpark.evChargers
              ? `<div class="text-[11px] text-amber-300 flex items-center gap-1 mb-2">
                  <span>⚡ ${carpark.evChargers.available}/${carpark.evChargers.total} EV points free (${carpark.evChargers.provider})</span>
                </div>`
              : ''
          }

          <div class="flex items-center justify-between pt-1 border-t border-slate-700/80 text-xs">
            <span class="text-slate-400">Clearance: ${carpark.heightClearanceMeters}m</span>
            <button id="popup-btn-${carpark.id}" class="text-emerald-400 hover:text-emerald-300 font-medium">
              View Rates & Calculator &rarr;
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoPan: true,
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${carpark.id}`);
        if (btn) {
          btn.onclick = () => onSelectCarpark(carpark);
        }
      });
    });
  }, [carparks, isFavorite, onSelectCarpark]);

  // Center on selected carpark when changed
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      const { lat, lng } = selectedCarpark.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
      const marker = markersRef.current.get(selectedCarpark.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedCarpark]);

  const handleZoomToRegion = (regionKey: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const region = REGION_CENTERS[regionKey];
    if (region) {
      map.flyTo([region.lat, region.lng], region.zoom, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-175px)] min-h-[500px] bg-slate-950 overflow-hidden">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Region Fast Jump Controls on Map */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap max-w-xs gap-1.5 p-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl shadow-xl">
        <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1 px-1">
          <span>Jump to SG Region:</span>
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        {Object.keys(REGION_CENTERS).map((regionKey) => (
          <button
            key={regionKey}
            onClick={() => handleZoomToRegion(regionKey)}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium border border-slate-700/60 transition-colors cursor-pointer"
          >
            {regionKey === 'All' ? 'Islandwide' : regionKey}
          </button>
        ))}
      </div>

      {/* Legend & Status Guide on Map */}
      <div className="absolute bottom-6 left-4 z-10 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 max-w-[220px]">
        <div className="font-semibold text-slate-200 text-xs mb-1">Live Vacancy Status</div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-emerald-300 shrink-0"></span>
          <span className="text-slate-300">&gt; 25% Lots Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-200 shrink-0"></span>
          <span className="text-slate-300">5% - 25% (Filling Fast)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-rose-300 shrink-0"></span>
          <span className="text-slate-300">&lt; 5% / High Congestion</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
          <span>⚡ = EV Fast Charging Ready</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import {
  Bookmark,
  Star,
  MapPin,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  LayoutGrid,
  List,
  Navigation,
  Clock,
  Car,
} from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
  onOpenEstimator: (carpark: Carpark) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onResetFilters: () => void;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  onSelectCarpark,
  onOpenEstimator,
  isFavorite,
  onToggleFavorite,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'dense'>('cards');

  if (carparks.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-4">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-100 mb-1">No carparks match your filter criteria</h3>
        <p className="text-xs text-slate-400 mb-5">
          Try expanding your search query, selecting "All Regions", or clearing special filters like high clearance or EV chargers.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Directory Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">Carpark Availability Directory</h2>
          <p className="text-xs text-slate-400">
            Real-time occupancy, rates, and vehicle clearances across Singapore
          </p>
        </div>

        {/* Dense vs Card View Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('dense')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'dense'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Compact High-Density Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carparks.map((cp) => {
            const ratio = cp.totalLots > 0 ? cp.availableLots / cp.totalLots : 0;
            const percentAvailable = Math.round(ratio * 100);
            const fav = isFavorite(cp.id);

            let statusColor = 'text-emerald-400';
            let barColor = 'bg-emerald-500';
            let statusBadge = 'Available';

            if (cp.availableLots <= 5 || ratio < 0.05) {
              statusColor = 'text-rose-400';
              barColor = 'bg-rose-500';
              statusBadge = 'Almost Full';
            } else if (cp.availableLots <= 35 || ratio < 0.2) {
              statusColor = 'text-amber-400';
              barColor = 'bg-amber-500';
              statusBadge = 'Filling Fast';
            }

            return (
              <div
                key={cp.id}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Top line: Name + Favorite */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                          {cp.operator.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{cp.region}</span>
                      </div>
                      <h3
                        onClick={() => onSelectCarpark(cp)}
                        className="font-bold text-sm text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors truncate"
                      >
                        {cp.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(cp.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        fav
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                      title={fav ? 'Remove from saved' : 'Save carpark'}
                    >
                      <Star className={`w-3.5 h-3.5 ${fav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-slate-400 truncate mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                    <span>{cp.address} ({cp.postalCode})</span>
                  </p>

                  {/* Lot Availability Meter */}
                  <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Available Lots</span>
                      <span className={`font-mono font-bold tabular-nums ${statusColor}`}>
                        {cp.availableLots}{' '}
                        <span className="text-slate-400 font-normal">/ {cp.totalLots}</span>
                        <span className="text-[11px] ml-1.5 font-normal">({percentAvailable}% vacant)</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(4, Math.min(100, (cp.availableLots / cp.totalLots) * 100))}%` }}
                      />
                    </div>

                    {/* Sub-lots info: Motorcycle & EV */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80">
                      <span>Clearance: <strong className="text-slate-300 font-mono">{cp.heightClearanceMeters}m</strong></span>
                      {cp.evChargers ? (
                        <span className="text-amber-300 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{cp.evChargers.available}/{cp.evChargers.total} EV Free</span>
                        </span>
                      ) : (
                        <span>EPS Gantry</span>
                      )}
                    </div>
                  </div>

                  {/* Rates Quick Summary */}
                  <div className="text-xs text-slate-300 space-y-1 mb-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-400 text-[11px]">Day Rate:</span>
                      <span className="font-mono text-slate-200 text-right truncate max-w-[200px]">
                        ${cp.rates.baseHourlyRate.toFixed(2)}/hr ({cp.rates.weekdayPeak.split('(')[0]})
                      </span>
                    </div>
                    {cp.freeParkingScheme !== 'None' && (
                      <div className="flex items-baseline justify-between text-emerald-400 text-[11px]">
                        <span>Free Scheme:</span>
                        <span className="truncate max-w-[200px]">{cp.freeParkingScheme}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                  <button
                    onClick={() => onOpenEstimator(cp)}
                    className="flex-1 py-1.5 px-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Calculate Fee
                  </button>
                  <button
                    onClick={() => onSelectCarpark(cp)}
                    className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Details & Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Data Table View */
        <div className="overflow-x-auto bg-slate-800/60 border border-slate-700/80 rounded-xl shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-700/80 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Carpark / Address</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3 text-right">Available Lots</th>
                <th className="py-3 px-3">Occupancy Bar</th>
                <th className="py-3 px-3 text-right">Est. Hourly Rate</th>
                <th className="py-3 px-3">Clearance</th>
                <th className="py-3 px-3">EV Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {carparks.map((cp) => {
                const ratio = cp.totalLots > 0 ? cp.availableLots / cp.totalLots : 0;
                const percent = Math.round(ratio * 100);
                const fav = isFavorite(cp.id);

                let statusColor = 'text-emerald-400';
                let barColor = 'bg-emerald-500';

                if (cp.availableLots <= 5 || ratio < 0.05) {
                  statusColor = 'text-rose-400';
                  barColor = 'bg-rose-500';
                } else if (cp.availableLots <= 35 || ratio < 0.2) {
                  statusColor = 'text-amber-400';
                  barColor = 'bg-amber-500';
                }

                return (
                  <tr key={cp.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleFavorite(cp.id)}
                          className="text-slate-500 hover:text-amber-400 cursor-pointer"
                        >
                          <Star className={`w-3.5 h-3.5 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <div>
                          <div
                            onClick={() => onSelectCarpark(cp)}
                            className="font-bold text-slate-100 hover:text-emerald-400 cursor-pointer truncate max-w-[240px]"
                          >
                            {cp.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                            {cp.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {cp.operator}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className={`font-bold ${statusColor}`}>{cp.availableLots}</span>
                      <span className="text-slate-400 text-[11px]"> / {cp.totalLots}</span>
                    </td>
                    <td className="py-2.5 px-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
                        </div>
                        <span className="font-mono text-[11px] tabular-nums text-slate-400 shrink-0">
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-200">
                      ${cp.rates.baseHourlyRate.toFixed(2)}/hr
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300">
                      {cp.heightClearanceMeters}m
                    </td>
                    <td className="py-2.5 px-3">
                      {cp.evChargers ? (
                        <span className="text-amber-300 text-[11px] font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{cp.evChargers.available}/{cp.evChargers.total}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEstimator(cp)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Calc
                        </button>
                        <button
                          onClick={() => onSelectCarpark(cp)}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

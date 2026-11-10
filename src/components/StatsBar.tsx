import React from 'react';
import { Carpark } from '../types/carpark';
import { ShieldCheck, Zap, AlertTriangle, Clock } from 'lucide-react';

interface StatsBarProps {
  carparks: Carpark[];
  lastUpdated: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ carparks, lastUpdated }) => {
  const totalCarparks = carparks.length;
  const totalCapacity = carparks.reduce((acc, c) => acc + c.totalLots, 0);
  const totalAvailable = carparks.reduce((acc, c) => acc + c.availableLots, 0);
  const occupancyPercent = totalCapacity > 0 ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100) : 0;
  const vacancyPercent = 100 - occupancyPercent;

  const totalEvAvailable = carparks.reduce((acc, c) => acc + (c.evChargers?.available || 0), 0);
  const totalEvChargers = carparks.reduce((acc, c) => acc + (c.evChargers?.total || 0), 0);

  const almostFullCount = carparks.filter((c) => (c.availableLots / c.totalLots) < 0.1 || c.availableLots <= 10).length;

  const formattedTime = new Date(lastUpdated).toLocaleTimeString('en-SG', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center text-xs">
          {/* Stat 1: Total Lots Available */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 font-normal">Available Lots</div>
              <div className="font-mono tabular-nums font-semibold text-slate-100">
                {totalAvailable.toLocaleString()} <span className="text-slate-400 text-[11px] font-normal">/ {totalCapacity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Islandwide Vacancy Rate */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <span className="font-mono text-xs font-bold">%</span>
            </div>
            <div>
              <div className="text-slate-400 font-normal">Islandwide Vacancy</div>
              <div className="font-mono tabular-nums font-semibold text-slate-100">
                {vacancyPercent}% <span className="text-slate-400 text-[11px] font-normal">({totalCarparks} hubs)</span>
              </div>
            </div>
          </div>

          {/* Stat 3: EV Charging Available */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 font-normal">EV Chargers Ready</div>
              <div className="font-mono tabular-nums font-semibold text-amber-300">
                {totalEvAvailable} <span className="text-slate-400 text-[11px] font-normal">/ {totalEvChargers} points</span>
              </div>
            </div>
          </div>

          {/* Stat 4: High Demand / Filling Fast */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 font-normal">Near Capacity (&lt;10%)</div>
              <div className="font-mono tabular-nums font-semibold text-rose-300">
                {almostFullCount} <span className="text-slate-400 text-[11px] font-normal">carparks</span>
              </div>
            </div>
          </div>

          {/* Stat 5: Telemetry Sync */}
          <div className="hidden lg:flex items-center gap-2.5 justify-end">
            <div className="text-right">
              <div className="text-slate-400 font-normal flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Last Telemetry Sync</span>
              </div>
              <div className="font-mono tabular-nums text-slate-300 font-medium">
                {formattedTime} SGT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

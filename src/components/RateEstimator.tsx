import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import { Calculator, ArrowRight, DollarSign, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface RateEstimatorProps {
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
}

export const RateEstimator: React.FC<RateEstimatorProps> = ({ carparks, onSelectCarpark }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('Orchard');
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [entryHour, setEntryHour] = useState<number>(14); // 2:00 PM default
  const [durationHours, setDurationHours] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const regionCarparks = carparks.filter(
    (c) => selectedRegion === 'All' || c.region.includes(selectedRegion)
  );

  const calculateCost = (carpark: Carpark): number => {
    const totalMinutes = durationHours * 60 + durationMinutes;
    if (totalMinutes <= carpark.rates.gracePeriodMins) return 0;

    if (dayType === 'sunday' && carpark.freeParkingScheme.toLowerCase().includes('sun')) {
      return 0;
    }

    if (carpark.operator === 'HDB' || carpark.operator === 'URA') {
      const blocks = Math.ceil(totalMinutes / 30);
      const isCentral =
        carpark.region === 'Central / CBD' ||
        carpark.region === 'Orchard' ||
        carpark.region === 'Marina Bay';
      const halfRate = isCentral && entryHour >= 7 && entryHour < 17 ? 1.4 : 0.6;
      let cost = blocks * halfRate;
      if (entryHour >= 22 || (entryHour < 7 && cost > 5.0)) {
        cost = Math.min(cost, 5.0);
      }
      return Math.round(cost * 100) / 100;
    }

    // Commercial mall
    const base = carpark.rates.baseHourlyRate;
    if (entryHour >= 18 && carpark.rates.weekdayOffPeak.includes('per entry')) {
      const match = carpark.rates.weekdayOffPeak.match(/\$([0-9.]+)/);
      return match ? parseFloat(match[1]) : 4.0;
    }

    const billableHours = totalMinutes / 60;
    return Math.round(billableHours * base * 100) / 100;
  };

  const sortedByCost = [...regionCarparks].sort((a, b) => calculateCost(a) - calculateCost(b));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Introduction */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <span>Singapore Parking Fee Comparison Estimator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Calculate and compare total parking costs across different carparks for your planned arrival time and duration.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Region filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Area</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="Orchard">Orchard Road Shopping Belt</option>
              <option value="Central">Central / CBD / Marina Bay</option>
              <option value="East">East (Tampines / Bedok / Changi)</option>
              <option value="West">West (Jurong / Clementi)</option>
              <option value="North">North (Woodlands / Yishun)</option>
              <option value="All">All Islandwide</option>
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Day of Week</label>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="weekday">Weekday (Mon - Fri)</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday / Public Holiday</option>
            </select>
          </div>

          {/* Planned Arrival Hour */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Planned Arrival Time</label>
            <select
              value={entryHour}
              onChange={(e) => setEntryHour(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {h < 10 ? `0${h}:00` : `${h}:00`} {h < 12 ? 'AM' : 'PM'}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expected Parking Duration</label>
            <div className="flex items-center gap-2">
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 24].map((h) => (
                  <option key={h} value={h}>
                    {h} hr{h === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Ranking carparks by lowest estimated cost for {durationHours}h {durationMinutes > 0 ? `${durationMinutes}m` : ''}:</span>
          <span className="font-mono">{sortedByCost.length} carparks evaluated</span>
        </div>

        {sortedByCost.map((cp, idx) => {
          const cost = calculateCost(cp);
          const isCheapest = idx === 0;

          return (
            <div
              key={cp.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCheapest
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                    isCheapest
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  #{idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {cp.operator}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 hover:text-emerald-400 cursor-pointer" onClick={() => onSelectCarpark(cp)}>
                      {cp.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{cp.address}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-emerald-400 font-semibold">{cp.availableLots} lots available</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Estimated Total</div>
                  <div className="font-mono text-lg font-extrabold text-emerald-400 tabular-nums">
                    ${cost.toFixed(2)} SGD
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {cp.rates.gracePeriodMins}m grace period
                  </div>
                </div>

                <button
                  onClick={() => onSelectCarpark(cp)}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

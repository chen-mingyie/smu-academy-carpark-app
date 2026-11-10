import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import {
  X,
  Star,
  MapPin,
  Zap,
  Navigation,
  Clock,
  Shield,
  DollarSign,
  TrendingUp,
  Info,
  Car,
  Bike,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [entryHour, setEntryHour] = useState<number>(new Date().getHours());
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!carpark) return null;

  const ratio = carpark.totalLots > 0 ? carpark.availableLots / carpark.totalLots : 0;
  const percentVacant = Math.round(ratio * 100);

  let statusBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let statusText = 'Normal - Good lot availability';
  if (carpark.availableLots <= 5 || ratio < 0.05) {
    statusBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    statusText = 'Critical - Less than 5% lots remaining';
  } else if (carpark.availableLots <= 35 || ratio < 0.2) {
    statusBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    statusText = 'Filling fast - High vehicle turnover';
  }

  // Calculate estimated fee
  const calculateEstimatedFee = (): number => {
    const totalMinutes = durationHours * 60 + durationMinutes;

    // Grace period check
    if (totalMinutes <= carpark.rates.gracePeriodMins) {
      return 0.0;
    }

    // Billable duration
    const billableHours = totalMinutes / 60;
    let fee = 0;

    if (dayType === 'sunday' && carpark.freeParkingScheme.toLowerCase().includes('sun')) {
      // Free or discounted on Sunday
      return 0.0;
    }

    if (carpark.operator === 'HDB' || carpark.operator === 'URA') {
      // Standard Singapore HDB/URA block calculations ($0.60 to $1.40 per 30 mins)
      const halfHourBlocks = Math.ceil(totalMinutes / 30);
      const isCentral = carpark.region === 'Central / CBD' || carpark.region === 'Orchard' || carpark.region === 'Marina Bay';
      const halfHourRate = isCentral && (entryHour >= 7 && entryHour < 17) ? 1.4 : 0.6;
      fee = halfHourBlocks * halfHourRate;

      // Cap at night rate if parking overnight
      if (entryHour >= 22 || (entryHour < 7 && fee > 5.0)) {
        fee = Math.min(fee, 5.0);
      }
    } else {
      // Commercial mall heuristic
      const base = carpark.rates.baseHourlyRate;
      if (entryHour >= 18 && carpark.rates.weekdayOffPeak.includes('per entry')) {
        // Flat evening entry
        fee = parseFloat(carpark.rates.weekdayOffPeak.replace(/[^0-9.]/g, '')) || 3.5;
      } else {
        fee = billableHours * base;
      }
    }

    return Math.round(fee * 100) / 100;
  };

  const estimatedTotal = calculateEstimatedFee();

  const handleCopyCoordinates = () => {
    const text = `${carpark.coordinates.lat.toFixed(6)}, ${carpark.coordinates.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const currentHour = new Date().getHours();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {carpark.operator.replace('_', ' ')}
              </span>
              <span className="text-slate-400">Carpark #{carpark.carparkNumber}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{carpark.region}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{carpark.name}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{carpark.address}, Singapore {carpark.postalCode}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Saved to bookmarks' : 'Save to bookmarks'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Live Vacancy Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${statusBg}`}>
            <div>
              <div className="font-bold text-sm text-white">Live Lot Availability</div>
              <div className="text-xs opacity-90">{statusText}</div>
            </div>
            <div className="text-right">
              <div className="font-mono tabular-nums text-2xl font-extrabold tracking-tight">
                {carpark.availableLots}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {carpark.totalLots}</span>
              </div>
              <div className="text-[11px] font-mono opacity-80">{percentVacant}% Vacant</div>
            </div>
          </div>

          {/* Vehicle Lots & Charging Sub-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cars */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Car className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-slate-200">Cars (Class 3)</span>
              </div>
              <div className="font-mono text-base font-bold text-slate-100 tabular-nums">
                {carpark.availableLots}{' '}
                <span className="text-xs font-normal text-slate-400">/ {carpark.totalLots}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Clearance: <strong className="text-slate-300 font-mono">{carpark.heightClearanceMeters}m</strong>
              </div>
            </div>

            {/* Motorcycles */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Bike className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-slate-200">Motorcycles</span>
              </div>
              <div className="font-mono text-base font-bold text-slate-100 tabular-nums">
                {carpark.motorcycleLots ? (
                  <>
                    {carpark.motorcycleLots.available}{' '}
                    <span className="text-xs font-normal text-slate-400">/ {carpark.motorcycleLots.total}</span>
                  </>
                ) : (
                  <span className="text-xs font-normal text-slate-400">Shared / EPS</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">EPS Gantry Entry</div>
            </div>

            {/* EV Charging */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-slate-200">EV Charging</span>
              </div>
              <div className="font-mono text-base font-bold text-amber-300 tabular-nums">
                {carpark.evChargers ? (
                  <>
                    {carpark.evChargers.available}{' '}
                    <span className="text-xs font-normal text-slate-400">/ {carpark.evChargers.total} free</span>
                  </>
                ) : (
                  <span className="text-xs font-normal text-slate-400">No EV Hub</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {carpark.evChargers ? `${carpark.evChargers.provider} (${carpark.evChargers.powerKw}kW)` : 'None'}
              </div>
            </div>
          </div>

          {/* 24-Hour Historical Occupancy Forecast */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Occupancy Forecast</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Current Time: <strong className="font-mono text-slate-200">{currentHour}:00 SGT</strong>
              </span>
            </div>

            {/* Sparkline Bar Chart */}
            <div className="flex items-end gap-1 h-20 pt-4 px-1">
              {carpark.historicalHourlyOccupancy.map((occ, idx) => {
                const isCurrent = idx === currentHour;
                let barColor = 'bg-slate-600';
                if (occ > 85) barColor = 'bg-rose-500';
                else if (occ > 65) barColor = 'bg-amber-500';
                else barColor = 'bg-emerald-500';

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                      {idx}:00 — {occ}% full
                    </div>

                    <div
                      className={`w-full rounded-t transition-all ${barColor} ${
                        isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-80'
                      }`}
                      style={{ height: `${Math.max(10, occ)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-1">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Parking Rates Breakdown */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Official Parking Rates Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5">Weekday Daytime (Peak)</span>
                <span className="font-mono text-slate-100 font-medium">{carpark.rates.weekdayPeak}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5">Weekday Evening / Night</span>
                <span className="font-mono text-slate-100 font-medium">{carpark.rates.weekdayOffPeak}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5">Saturdays</span>
                <span className="font-mono text-slate-100 font-medium">{carpark.rates.saturday}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5">Sundays & Public Holidays</span>
                <span className="font-mono text-slate-100 font-medium">{carpark.rates.sundayPh}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Grace Period: <strong className="text-slate-300 font-mono">{carpark.rates.gracePeriodMins} minutes</strong></span>
              <span>Free Parking: <strong className="text-emerald-400 font-medium">{carpark.freeParkingScheme}</strong></span>
            </div>
          </div>

          {/* Interactive Parking Fee Calculator */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 p-4 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Estimated Parking Cost</span>
              </div>
              <div className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
                ${estimatedTotal.toFixed(2)} SGD
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Day of Week</label>
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="weekday">Weekday (Mon - Fri)</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday / Public Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Entry Time</label>
                <select
                  value={entryHour}
                  onChange={(e) => setEntryHour(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {h < 10 ? `0${h}:00` : `${h}:00`} {h < 12 ? 'AM' : 'PM'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Parking Duration</label>
                <div className="flex items-center gap-1">
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 24].map((hr) => (
                      <option key={hr} value={hr}>
                        {hr} hr{hr === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
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
        </div>

        {/* Modal Bottom Action Bar (Navigation Launchers) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCoordinates}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCoords ? 'Copied' : 'Copy Lat/Lng'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Maps */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate (Google Maps)</span>
            </a>

            {/* Waze */}
            <a
              href={`https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Waze</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

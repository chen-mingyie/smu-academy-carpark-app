import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Zap, Check } from 'lucide-react';
import { CarparkFilterState, OperatorType, RegionType, VehicleFilter } from '../types/carpark';

interface SearchAndFiltersProps {
  filters: CarparkFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CarparkFilterState>>;
  totalMatching: number;
}

const REGIONS: RegionType[] = [
  'All Regions',
  'Central / CBD',
  'Orchard',
  'Marina Bay',
  'East',
  'West',
  'North',
  'North-East',
  'Sentosa / South',
];

const OPERATORS: { label: string; value: 'All' | OperatorType }[] = [
  { label: 'All Operators', value: 'All' },
  { label: 'HDB Housing', value: 'HDB' },
  { label: 'Commercial Malls', value: 'LTA_COMMERCIAL' },
  { label: 'URA Street/Off-Street', value: 'URA' },
  { label: 'Private Towers', value: 'PRIVATE' },
];

const QUICK_LANDMARKS = [
  'Orchard Road',
  'Marina Bay Sands',
  'Suntec City',
  'Our Tampines Hub',
  'Jurong East',
  'Woodlands',
  'VivoCity',
  'Jewel Changi',
];

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  setFilters,
  totalMatching,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  };

  const handleQuickLandmark = (landmark: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: prev.searchQuery === landmark ? '' : landmark,
    }));
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Row 1: Search Input & Quick Landmarks */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by carpark name, mall, postal code (e.g. Takashimaya, 528523)..."
              className="w-full pl-10 pr-9 py-2 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 focus:border-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {filters.searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Landmark Jump Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs text-slate-400">
            <span className="shrink-0 text-slate-400 font-medium mr-1">Popular:</span>
            {QUICK_LANDMARKS.map((landmark) => {
              const isSelected = filters.searchQuery.toLowerCase() === landmark.toLowerCase();
              return (
                <button
                  key={landmark}
                  onClick={() => handleQuickLandmark(landmark)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {landmark}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Region Tabs & Operator Segmented Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between pt-1">
          {/* Region horizontal filter */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {REGIONS.map((region) => {
              const active = filters.region === region;
              return (
                <button
                  key={region}
                  onClick={() => setFilters((prev) => ({ ...prev, region }))}
                  className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>

          {/* Results count label */}
          <div className="shrink-0 text-xs text-slate-400 font-mono tabular-nums">
            Showing <span className="font-semibold text-slate-200">{totalMatching}</span> carparks
          </div>
        </div>

        {/* Row 3: Secondary Filters (Operator, Vehicle Type, EV, Height clearance, Sort) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Operator Select */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/70">
            <span className="text-slate-400">Operator:</span>
            <select
              value={filters.operator}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, operator: e.target.value as 'All' | OperatorType }))
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium pr-1"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value} className="bg-slate-800 text-slate-100">
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Select */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/70">
            <span className="text-slate-400">Vehicle:</span>
            <select
              value={filters.vehicleType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, vehicleType: e.target.value as VehicleFilter }))
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium pr-1"
            >
              <option value="Cars" className="bg-slate-800 text-slate-100">
                Cars (Class 3)
              </option>
              <option value="Motorcycles" className="bg-slate-800 text-slate-100">
                Motorcycles (Class 2)
              </option>
              <option value="Heavy Vehicles" className="bg-slate-800 text-slate-100">
                Heavy Vehicles (Class 4/5)
              </option>
            </select>
          </div>

          {/* EV Charging only button toggle */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, evChargingOnly: !prev.evChargingOnly }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filters.evChargingOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>EV Charging Available</span>
            {filters.evChargingOnly && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
          </button>

          {/* Height Clearance >= 2.1m toggle */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                minHeightClearance: prev.minHeightClearance === 2.1 ? 0 : 2.1,
              }))
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filters.minHeightClearance >= 2.1
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-medium'
                : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>High Clearance (&ge;2.1m)</span>
            {filters.minHeightClearance >= 2.1 && <Check className="w-3 h-3 text-blue-400 ml-0.5" />}
          </button>

          {/* Only Available Lots (>0) */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, onlyAvailable: !prev.onlyAvailable }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filters.onlyAvailable
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:text-white'
            }`}
          >
            <span>Lots Available Only</span>
            {filters.onlyAvailable && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
          </button>

          {/* Sort Selector */}
          <div className="ml-auto flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/70">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as CarparkFilterState['sortBy'],
                }))
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium pr-1"
            >
              <option value="availabilityPercent" className="bg-slate-800 text-slate-100">
                Highest % Vacancy
              </option>
              <option value="availableLots" className="bg-slate-800 text-slate-100">
                Most Available Lots
              </option>
              <option value="lowestRate" className="bg-slate-800 text-slate-100">
                Lowest Hourly Rate
              </option>
              <option value="name" className="bg-slate-800 text-slate-100">
                Alphabetical (A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

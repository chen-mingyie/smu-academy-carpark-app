import React from 'react';
import { RefreshCw, Radio, Layers, Calculator, Code2, Bookmark } from 'lucide-react';

interface NavbarProps {
  activeView: 'map' | 'list' | 'calculator' | 'api';
  setActiveView: (view: 'map' | 'list' | 'calculator' | 'api') => void;
  onRefreshLots: () => void;
  isRefreshing: boolean;
  liveSimulationActive: boolean;
  toggleLiveSimulation: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenApiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onRefreshLots,
  isRefreshing,
  liveSimulationActive,
  toggleLiveSimulation,
  favoritesCount,
  onOpenFavorites,
  onOpenApiModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element wordmark in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
            P
          </div>
          <button
            onClick={() => setActiveView('map')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              SG ParkWatch
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400 ml-2 font-mono">
              Live Lot Availability
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links with hover transitions) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveView('map')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeView === 'map'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Map View</span>
          </button>

          <button
            onClick={() => setActiveView('list')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeView === 'list'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Directory & Lots</span>
          </button>

          <button
            onClick={() => setActiveView('calculator')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeView === 'calculator'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Rate Estimator</span>
          </button>

          <button
            onClick={onOpenFavorites}
            className="cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 text-slate-400 hover:text-white"
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Lots ({favoritesCount})</span>
          </button>

          <button
            onClick={onOpenApiModal}
            className="cursor-pointer transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 text-slate-400 hover:text-amber-400"
          >
            <Code2 className="w-4 h-4" />
            <span>Backend Integration</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live simulation toggle button */}
          <button
            onClick={toggleLiveSimulation}
            title={liveSimulationActive ? 'Pause real-time auto-flux' : 'Start real-time auto-flux'}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              liveSimulationActive
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveSimulationActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="whitespace-nowrap font-mono">
              {liveSimulationActive ? 'Live Stream Active' : 'Simulation Paused'}
            </span>
          </button>

          {/* Primary Refresh Action */}
          <button
            onClick={onRefreshLots}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Lots'}</span>
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 px-2 py-2 bg-slate-900/90 text-xs">
        <button
          onClick={() => setActiveView('map')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            activeView === 'map' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            activeView === 'list' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Directory</span>
        </button>
        <button
          onClick={() => setActiveView('calculator')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            activeView === 'calculator' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Rates</span>
        </button>
        <button
          onClick={onOpenFavorites}
          className="flex items-center gap-1 py-1 px-2 rounded font-medium text-slate-400 hover:text-white"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({favoritesCount})</span>
        </button>
      </div>
    </header>
  );
};

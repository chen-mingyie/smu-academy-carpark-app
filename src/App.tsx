import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CarparkService } from './services/carparkService';
import { Carpark, CarparkFilterState } from './types/carpark';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { SearchAndFilters } from './components/SearchAndFilters';
import { CarparkMap } from './components/CarparkMap';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { RateEstimator } from './components/RateEstimator';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { ShieldCheck, Zap, Code2, MapPin, Radio } from 'lucide-react';

const DEFAULT_FILTERS: CarparkFilterState = {
  searchQuery: '',
  region: 'All Regions',
  operator: 'All',
  vehicleType: 'Cars',
  onlyAvailable: false,
  evChargingOnly: false,
  minHeightClearance: 0,
  sortBy: 'availabilityPercent',
  sortOrder: 'desc',
};

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(() => CarparkService.getAllCarparks());
  const [filters, setFilters] = useState<CarparkFilterState>(DEFAULT_FILTERS);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [activeView, setActiveView] = useState<'map' | 'list' | 'calculator' | 'api'>('map');
  const [favorites, setFavorites] = useState<string[]>(() => CarparkService.getFavoriteIds());
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveSimulationActive, setLiveSimulationActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toISOString());

  // Automatic real-time vehicle movement simulation
  useEffect(() => {
    if (!liveSimulationActive) return;

    const timer = setInterval(() => {
      const updated = CarparkService.simulateLiveFluctuations('normal');
      setCarparks(updated);
      setLastUpdated(new Date().toISOString());

      // If a carpark is currently open in modal, keep its live stats synced
      setSelectedCarpark((prev) => {
        if (!prev) return null;
        return updated.find((c) => c.id === prev.id) || prev;
      });
    }, 12000); // Ticks every 12 seconds for natural live monitoring

    return () => clearInterval(timer);
  }, [liveSimulationActive]);

  // Manual Refresh Handler
  const handleRefreshLots = useCallback(async () => {
    setIsRefreshing(true);
    const customEndpoint = CarparkService.getCustomEndpoint();

    if (customEndpoint) {
      await CarparkService.fetchFromBackend(customEndpoint);
      setCarparks(CarparkService.getAllCarparks());
    } else {
      // Simulate live sync with random flux
      await new Promise((resolve) => setTimeout(resolve, 600));
      const updated = CarparkService.simulateLiveFluctuations('normal');
      setCarparks(updated);
    }

    setLastUpdated(new Date().toISOString());
    setIsRefreshing(false);
  }, []);

  // Favorites management
  const handleToggleFavorite = useCallback((id: string) => {
    const updated = CarparkService.toggleFavorite(id);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const favoriteCarparks = useMemo(() => {
    return carparks.filter((c) => favorites.includes(c.id));
  }, [carparks, favorites]);

  // Filtering & Sorting
  const filteredCarparks = useMemo(() => {
    return carparks
      .filter((cp) => {
        // Search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchName = cp.name.toLowerCase().includes(query);
          const matchAddress = cp.address.toLowerCase().includes(query);
          const matchPostal = cp.postalCode.includes(query);
          const matchCode = cp.carparkNumber.toLowerCase().includes(query);
          const matchRegion = cp.region.toLowerCase().includes(query);
          if (!matchName && !matchAddress && !matchPostal && !matchCode && !matchRegion) {
            return false;
          }
        }

        // Region
        if (filters.region !== 'All Regions' && cp.region !== filters.region) {
          return false;
        }

        // Operator
        if (filters.operator !== 'All' && cp.operator !== filters.operator) {
          return false;
        }

        // Available lots only
        if (filters.onlyAvailable && cp.availableLots <= 0) {
          return false;
        }

        // EV Charging only
        if (filters.evChargingOnly && (!cp.evChargers || cp.evChargers.available <= 0)) {
          return false;
        }

        // Height clearance
        if (filters.minHeightClearance > 0 && cp.heightClearanceMeters < filters.minHeightClearance) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'availabilityPercent') {
          const ratioA = a.totalLots > 0 ? a.availableLots / a.totalLots : 0;
          const ratioB = b.totalLots > 0 ? b.availableLots / b.totalLots : 0;
          return ratioB - ratioA;
        }
        if (filters.sortBy === 'availableLots') {
          return b.availableLots - a.availableLots;
        }
        if (filters.sortBy === 'lowestRate') {
          return a.rates.baseHourlyRate - b.rates.baseHourlyRate;
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [carparks, filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'api') {
            setIsApiModalOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        onRefreshLots={handleRefreshLots}
        isRefreshing={isRefreshing}
        liveSimulationActive={liveSimulationActive}
        toggleLiveSimulation={() => setLiveSimulationActive((prev) => !prev)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
      />

      {/* Real-time Telemetry & Overall Island Statistics Strip */}
      <StatsBar carparks={carparks} lastUpdated={lastUpdated} />

      {/* Filter and Destination Search Bar (shown on Map and List views) */}
      {(activeView === 'map' || activeView === 'list') && (
        <SearchAndFilters
          filters={filters}
          setFilters={setFilters}
          totalMatching={filteredCarparks.length}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1">
        {activeView === 'map' && (
          <CarparkMap
            carparks={filteredCarparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={(cp) => setSelectedCarpark(cp)}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeView === 'list' && (
          <CarparkList
            carparks={filteredCarparks}
            onSelectCarpark={(cp) => setSelectedCarpark(cp)}
            onOpenEstimator={(cp) => {
              setSelectedCarpark(cp);
            }}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onResetFilters={handleResetFilters}
          />
        )}

        {activeView === 'calculator' && (
          <RateEstimator
            carparks={carparks}
            onSelectCarpark={(cp) => setSelectedCarpark(cp)}
          />
        )}
      </main>

      {/* Footer conforming to Universal Design Constitution */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SG ParkWatch</span>
            <span>·</span>
            <span>Singapore Real-Time Carpark Availability &amp; Rate Tracker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Backend API Adapter</span>
            </button>
            <span>·</span>
            <span>Supports Data.gov.sg &amp; LTA DataMall v2</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CarparkDetailModal
        carpark={selectedCarpark}
        onClose={() => setSelectedCarpark(null)}
        isFavorite={selectedCarpark ? isFavorite(selectedCarpark.id) : false}
        onToggleFavorite={() => {
          if (selectedCarpark) {
            handleToggleFavorite(selectedCarpark.id);
          }
        }}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteCarparks={favoriteCarparks}
        onSelectCarpark={(cp) => {
          setSelectedCarpark(cp);
          if (activeView === 'calculator') {
            setActiveView('map');
          }
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onEndpointUpdated={handleRefreshLots}
      />
    </div>
  );
}

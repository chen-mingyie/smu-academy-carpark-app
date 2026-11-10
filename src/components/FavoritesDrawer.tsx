import React from 'react';
import { Carpark } from '../types/carpark';
import { X, Bookmark, Star, ArrowRight, Zap, MapPin } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteCarparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favoriteCarparks,
  onSelectCarpark,
  onToggleFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Saved Frequent Carparks ({favoriteCarparks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Favorites */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favoriteCarparks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-200">No saved carparks yet</div>
              <p className="text-xs text-slate-400 mt-1">
                Click the star icon on any carpark card or map popup to pin your home, office, or favorite spots here for instant tracking.
              </p>
            </div>
          ) : (
            favoriteCarparks.map((cp) => {
              const ratio = cp.totalLots > 0 ? cp.availableLots / cp.totalLots : 0;
              const percent = Math.round(ratio * 100);

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
                <div
                  key={cp.id}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-mono uppercase px-1 py-0.2 rounded bg-slate-900 border border-slate-700">
                          {cp.operator}
                        </span>
                        <span>{cp.region}</span>
                      </div>
                      <h4
                        onClick={() => {
                          onSelectCarpark(cp);
                          onClose();
                        }}
                        className="font-bold text-xs text-white hover:text-emerald-400 cursor-pointer truncate"
                      >
                        {cp.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(cp.id)}
                      className="text-amber-400 hover:text-slate-400 cursor-pointer p-1"
                      title="Remove bookmark"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>

                  {/* Lot meter */}
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400 text-[11px]">Available</span>
                      <span className={`font-mono font-bold tabular-nums ${statusColor}`}>
                        {cp.availableLots}{' '}
                        <span className="text-slate-400 font-normal">/ {cp.totalLots}</span>{' '}
                        <span className="text-[10px] font-normal">({percent}% free)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>${cp.rates.baseHourlyRate.toFixed(2)}/hr</span>
                    <button
                      onClick={() => {
                        onSelectCarpark(cp);
                        onClose();
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View &amp; Navigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

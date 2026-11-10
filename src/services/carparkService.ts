import { INITIAL_CARPARKS } from '../data/singaporeCarparks';
import { Carpark, LiveSimulationSettings } from '../types/carpark';

const STORAGE_KEY_FAVORITES = 'sg_parkwatch_favorites';
const STORAGE_KEY_CUSTOM_ENDPOINT = 'sg_parkwatch_custom_endpoint';

export interface DataGovSgCarparkInfo {
  total_lots: string;
  lot_type: string;
  lots_available: string;
}

export interface DataGovSgCarparkData {
  carpark_number: string;
  update_datetime: string;
  carpark_info: DataGovSgCarparkInfo[];
}

export interface DataGovSgApiResponse {
  items: Array<{
    timestamp: string;
    carpark_data: DataGovSgCarparkData[];
  }>;
}

export interface LtaDataMallItem {
  CarParkID: string;
  Area?: string;
  Development?: string;
  Location?: string; // "1.2935 103.8572"
  AvailableLots: number | string;
  LotType: string; // "C", "M", "H"
  Agency?: string; // "HDB", "LTA", "URA"
}

export interface LtaDataMallApiResponse {
  'odata.metadata'?: string;
  value: LtaDataMallItem[];
}

export class CarparkService {
  private static carparks: Carpark[] = [...INITIAL_CARPARKS];

  public static getAllCarparks(): Carpark[] {
    return [...this.carparks];
  }

  public static getCarparkById(id: string): Carpark | undefined {
    return this.carparks.find((c) => c.id === id);
  }

  public static getFavoriteIds(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default favorites (ION Orchard, Our Tampines Hub, Marina One)
    return ['sg-orchard-ion', 'sg-east-oth', 'sg-cbd-marinaone'];
  }

  public static toggleFavorite(carparkId: string): string[] {
    const current = this.getFavoriteIds();
    const updated = current.includes(carparkId)
      ? current.filter((id) => id !== carparkId)
      : [...current, carparkId];

    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  public static isFavorite(carparkId: string): boolean {
    return this.getFavoriteIds().includes(carparkId);
  }

  public static getCustomEndpoint(): string {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_ENDPOINT) || '/api/carparkavailability';
  }

  public static setCustomEndpoint(endpoint: string): void {
    if (endpoint.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_ENDPOINT, endpoint.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_ENDPOINT);
    }
  }

  /**
   * Simulates real-world carpark lot flux (cars entering and leaving gantries).
   * Keeps counts strictly bounded between 0 and totalLots.
   */
  public static simulateLiveFluctuations(trend: LiveSimulationSettings['trend'] = 'normal'): Carpark[] {
    const now = new Date();
    const hour = now.getHours();

    this.carparks = this.carparks.map((cp) => {
      // 70% chance of 1-3 lot variation
      if (Math.random() > 0.7) return cp;

      // Determine delta bias based on trend / hour
      let bias = 0;
      if (trend === 'peak' || (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 20)) {
        // High incoming cars bias
        bias = -1;
      } else if (trend === 'late-night' || hour >= 22 || hour <= 6) {
        // Cars departing bias
        bias = 1;
      }

      const rawDelta = Math.floor(Math.random() * 5) - 2 + bias; // between -3 and +2
      const delta = Math.max(-4, Math.min(4, rawDelta));

      let newAvailable = cp.availableLots + delta;
      newAvailable = Math.max(0, Math.min(cp.totalLots, newAvailable));

      let updatedEv = cp.evChargers;
      if (updatedEv && Math.random() > 0.85) {
        const evDelta = Math.random() > 0.5 ? 1 : -1;
        const newEvAvail = Math.max(0, Math.min(updatedEv.total, updatedEv.available + evDelta));
        updatedEv = { ...updatedEv, available: newEvAvail };
      }

      return {
        ...cp,
        availableLots: newAvailable,
        evChargers: updatedEv,
        lastUpdated: now.toISOString(),
      };
    });

    return [...this.carparks];
  }

  /**
   * Integration point for user's future backend or Data.gov.sg endpoint.
   * Can be invoked directly when the user integrates their backend server or proxy.
   */
  public static async fetchFromBackend(endpointUrl?: string): Promise<{ success: boolean; message: string; count?: number }> {
    const targetUrl = endpointUrl || this.getCustomEndpoint();

    if (!targetUrl) {
      return {
        success: false,
        message: 'No backend endpoint specified. In frontend-only mode, using high-fidelity simulated Singapore live data stream.',
      };
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for missing account key error from serverless route
      if (data && data.error === 'ACCOUNT_KEY_MISSING') {
        return {
          success: false,
          message: 'Serverless route /api/carparkavailability is active, but LTA_DATAMALL_ACCOUNT_KEY is not set yet in environment.',
        };
      }

      // If response conforms to LTA DataMall v2 format { value: [...] }
      if (data && data.value && Array.isArray(data.value)) {
        const ltaItems = data.value as LtaDataMallItem[];
        let matchedCount = 0;

        this.carparks = this.carparks.map((cp) => {
          const matched = ltaItems.find(
            (item) =>
              item.CarParkID === cp.carparkNumber ||
              item.CarParkID === cp.id ||
              (item.Development && cp.name.toLowerCase().includes(item.Development.toLowerCase()))
          );

          if (matched) {
            matchedCount++;
            const available = typeof matched.AvailableLots === 'number'
              ? matched.AvailableLots
              : parseInt(matched.AvailableLots, 10) || cp.availableLots;

            return {
              ...cp,
              availableLots: Math.min(cp.totalLots, available),
              lastUpdated: new Date().toISOString(),
            };
          }
          return cp;
        });

        return {
          success: true,
          message: `Successfully synced ${matchedCount} carparks from LTA DataMall CarParkAvailabilityv2 (${ltaItems.length} total lots reported by LTA).`,
          count: matchedCount,
        };
      }

      // If response conforms to data.gov.sg format
      if (data && data.items && data.items[0]?.carpark_data) {
        const remoteData = data.items[0].carpark_data as DataGovSgCarparkData[];
        let matchedCount = 0;

        this.carparks = this.carparks.map((cp) => {
          const matched = remoteData.find(
            (r) => r.carpark_number.toUpperCase() === cp.carparkNumber.toUpperCase()
          );

          if (matched && matched.carpark_info && matched.carpark_info[0]) {
            matchedCount++;
            const total = parseInt(matched.carpark_info[0].total_lots, 10) || cp.totalLots;
            const available = parseInt(matched.carpark_info[0].lots_available, 10) || cp.availableLots;

            return {
              ...cp,
              totalLots: total,
              availableLots: Math.min(total, available),
              lastUpdated: matched.update_datetime || new Date().toISOString(),
            };
          }
          return cp;
        });

        return {
          success: true,
          message: `Successfully synced ${matchedCount} carparks from remote API.`,
          count: matchedCount,
        };
      }

      // If response is a direct array of Carpark objects
      if (Array.isArray(data)) {
        this.carparks = data;
        return {
          success: true,
          message: `Successfully loaded ${data.length} carpark records from backend endpoint.`,
          count: data.length,
        };
      }

      return {
        success: true,
        message: 'Endpoint reachable and responded with valid JSON.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to connect to backend: ${err.message || 'Unknown network error'}.`,
      };
    }
  }
}

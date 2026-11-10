export type OperatorType = 'HDB' | 'URA' | 'LTA_COMMERCIAL' | 'PRIVATE';

export type RegionType =
  | 'All Regions'
  | 'Central / CBD'
  | 'Orchard'
  | 'Marina Bay'
  | 'East'
  | 'West'
  | 'North'
  | 'North-East'
  | 'Sentosa / South';

export type VehicleFilter = 'Cars' | 'Motorcycles' | 'Heavy Vehicles';

export interface CarparkRates {
  weekdayPeak: string;
  weekdayOffPeak: string;
  saturday: string;
  sundayPh: string;
  gracePeriodMins: number;
  flatNightRate?: string;
  baseHourlyRate: number; // For fee calculation
  peakStartHour?: number; // 7 for 7am
  peakEndHour?: number;   // 17 for 5pm
}

export interface EVChargerInfo {
  total: number;
  available: number;
  provider: 'SP Mobility' | 'Shell Recharge' | 'Charge+' | 'CDG ENGIE' | 'Tesla Supercharger';
  powerKw: number;
  type: 'AC Type 2' | 'DC Fast (50kW)' | 'DC Ultra (100kW+)';
}

export interface Carpark {
  id: string;
  carparkNumber: string; // e.g. "ACB", "TP24", "ION-B2"
  name: string;
  operator: OperatorType;
  region: RegionType;
  address: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  carparkType: 'Multi-Storey (MSCP)' | 'Surface Carpark' | 'Basement' | 'Mechanised';
  electronicParkingSystem: boolean; // EPS
  heightClearanceMeters: number; // e.g. 2.15
  totalLots: number;
  availableLots: number;
  motorcycleLots?: {
    total: number;
    available: number;
  };
  heavyVehicleLots?: {
    total: number;
    available: number;
  };
  evChargers?: EVChargerInfo;
  rates: CarparkRates;
  shortTermParking: 'Whole Day' | '7:00 AM to 10:30 PM' | 'Night Only' | 'No';
  nightParkingAvailable: boolean;
  freeParkingScheme: string; // e.g. "Sun & PH (7am - 10:30pm)" or "None"
  lastUpdated: string; // ISO string
  historicalHourlyOccupancy: number[]; // 24 values (00:00 to 23:00) representing % occupancy
}

export interface CarparkFilterState {
  searchQuery: string;
  region: RegionType;
  operator: 'All' | OperatorType;
  vehicleType: VehicleFilter;
  onlyAvailable: boolean;
  evChargingOnly: boolean;
  minHeightClearance: number; // 0 for any, 2.0 for >=2.0m
  sortBy: 'availabilityPercent' | 'availableLots' | 'lowestRate' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface LiveSimulationSettings {
  enabled: boolean;
  intervalSeconds: number;
  trend: 'auto' | 'peak' | 'normal' | 'late-night';
}

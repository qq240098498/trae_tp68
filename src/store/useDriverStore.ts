import { create } from 'zustand';
import type { Driver, DriverStatus } from '@/types';
import { mockDrivers } from '@/mock';

interface DriverStore {
  drivers: Driver[];
  loading: boolean;
  fetchDrivers: () => Promise<void>;
  getDriverById: (id: string) => Driver | undefined;
  getAvailableDrivers: () => Driver[];
  updateDriverStatus: (id: string, status: DriverStatus) => Promise<void>;
  updateDriverLocation: (id: string, lng: number, lat: number) => Promise<void>;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],
  loading: false,

  fetchDrivers: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ drivers: [...mockDrivers], loading: false });
  },

  getDriverById: (id: string) => {
    return get().drivers.find((driver) => driver.id === id);
  },

  getAvailableDrivers: () => {
    return get().drivers.filter((driver) => driver.status === 'online');
  },

  updateDriverStatus: async (id: string, status: DriverStatus) => {
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === id ? { ...driver, status } : driver
      ),
    }));
  },

  updateDriverLocation: async (id: string, lng: number, lat: number) => {
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === id ? { ...driver, currentLng: lng, currentLat: lat } : driver
      ),
    }));
  },
}));

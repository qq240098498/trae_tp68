import type { VehicleType } from '@/types';

const VEHICLE_SPECS: Array<{
  type: VehicleType;
  maxWeight: number;
  maxVolume: number;
}> = [
  { type: 'van', maxWeight: 0.5, maxVolume: 3 },
  { type: 'small_truck', maxWeight: 1, maxVolume: 6 },
  { type: 'medium_truck', maxWeight: 2.5, maxVolume: 15 },
  { type: 'large_truck', maxWeight: 5, maxVolume: 35 },
];

export function matchVehicle(weight: number, volume: number): VehicleType {
  for (const spec of VEHICLE_SPECS) {
    if (weight <= spec.maxWeight && volume <= spec.maxVolume) {
      return spec.type;
    }
  }
  return 'large_truck';
}

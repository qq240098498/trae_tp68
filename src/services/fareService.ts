import type { VehicleType, VehiclePricing, FareDetail } from '@/types';

export const VEHICLE_PRICING: Record<VehicleType, VehiclePricing> = {
  van: {
    type: 'van',
    name: '面包车',
    baseFare: 30,
    mileagePrice: 3,
    baseMileage: 5,
    floorPrice: 10,
    largeItemPrice: 20,
    loadCapacity: 0.5,
    volumeCapacity: 3,
    icon: 'Van',
  },
  small_truck: {
    type: 'small_truck',
    name: '小厢货',
    baseFare: 55,
    mileagePrice: 4,
    baseMileage: 5,
    floorPrice: 15,
    largeItemPrice: 30,
    loadCapacity: 1,
    volumeCapacity: 6,
    icon: 'Truck',
  },
  medium_truck: {
    type: 'medium_truck',
    name: '4.2米厢货',
    baseFare: 120,
    mileagePrice: 5.5,
    baseMileage: 5,
    floorPrice: 25,
    largeItemPrice: 50,
    loadCapacity: 2.5,
    volumeCapacity: 15,
    icon: 'Truck',
  },
  large_truck: {
    type: 'large_truck',
    name: '6.8米厢货',
    baseFare: 200,
    mileagePrice: 7,
    baseMileage: 5,
    floorPrice: 40,
    largeItemPrice: 80,
    loadCapacity: 5,
    volumeCapacity: 35,
    icon: 'Truck',
  },
};

interface CalculateFareParams {
  vehicleType: VehicleType;
  distance: number;
  originFloor: number;
  destFloor: number;
  needHandling: boolean;
  largeItemCount: number;
}

export function calculateFare(params: CalculateFareParams): FareDetail {
  const { vehicleType, distance, originFloor, destFloor, needHandling, largeItemCount } = params;
  const pricing = VEHICLE_PRICING[vehicleType];

  const baseFare = pricing.baseFare;

  const mileageFare = distance > pricing.baseMileage
    ? (distance - pricing.baseMileage) * pricing.mileagePrice
    : 0;

  const floorFare = needHandling
    ? Math.max(0, originFloor - 1 + destFloor - 1) * pricing.floorPrice
    : 0;

  const largeItemFare = largeItemCount * pricing.largeItemPrice;

  const totalFare = baseFare + mileageFare + floorFare + largeItemFare;

  return {
    baseFare,
    mileageFare,
    floorFare,
    largeItemFare,
    totalFare,
  };
}

import type { VehicleType, VehiclePricing, FareDetail, FloorFareDetail } from '@/types';

export const VEHICLE_PRICING: Record<VehicleType, VehiclePricing> = {
  van: {
    type: 'van',
    name: '面包车',
    baseFare: 30,
    mileagePrice: 3,
    baseMileage: 5,
    floorPriceElevator: 5,
    floorPriceNoElevatorLow: 10,
    floorPriceNoElevatorMid: 15,
    floorPriceNoElevatorHigh: 20,
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
    floorPriceElevator: 8,
    floorPriceNoElevatorLow: 15,
    floorPriceNoElevatorMid: 22,
    floorPriceNoElevatorHigh: 30,
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
    floorPriceElevator: 12,
    floorPriceNoElevatorLow: 25,
    floorPriceNoElevatorMid: 38,
    floorPriceNoElevatorHigh: 50,
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
    floorPriceElevator: 20,
    floorPriceNoElevatorLow: 40,
    floorPriceNoElevatorMid: 60,
    floorPriceNoElevatorHigh: 80,
    largeItemPrice: 80,
    loadCapacity: 5,
    volumeCapacity: 35,
    icon: 'Truck',
  },
};

export function getFloorPrice(floor: number, hasElevator: boolean, pricing: VehiclePricing): number {
  if (floor <= 1) return 0;
  if (hasElevator) return pricing.floorPriceElevator;
  if (floor >= 2 && floor <= 4) return pricing.floorPriceNoElevatorLow;
  if (floor >= 5 && floor <= 6) return pricing.floorPriceNoElevatorMid;
  return pricing.floorPriceNoElevatorHigh;
}

interface CalculateFareParams {
  vehicleType: VehicleType;
  distance: number;
  originFloor: number;
  originHasElevator: boolean;
  destFloor: number;
  destHasElevator: boolean;
  needHandling: boolean;
  largeItemCount: number;
}

export function calculateFare(params: CalculateFareParams): FareDetail {
  const {
    vehicleType,
    distance,
    originFloor,
    originHasElevator,
    destFloor,
    destHasElevator,
    needHandling,
    largeItemCount,
  } = params;
  const pricing = VEHICLE_PRICING[vehicleType];

  const baseFare = pricing.baseFare;

  const mileageFare = distance > pricing.baseMileage
    ? (distance - pricing.baseMileage) * pricing.mileagePrice
    : 0;

  let floorFare = 0;
  let floorFareDetail: FloorFareDetail | undefined;

  if (needHandling) {
    const originPricePerFloor = getFloorPrice(originFloor, originHasElevator, pricing);
    const destPricePerFloor = getFloorPrice(destFloor, destHasElevator, pricing);
    const originFare = Math.max(0, originFloor - 1) * originPricePerFloor;
    const destFare = Math.max(0, destFloor - 1) * destPricePerFloor;
    floorFare = originFare + destFare;

    floorFareDetail = {
      origin: Math.max(0, originFloor - 1),
      dest: Math.max(0, destFloor - 1),
      originHasElevator,
      destHasElevator,
      originPricePerFloor,
      destPricePerFloor,
    };
  }

  const largeItemFare = largeItemCount * pricing.largeItemPrice;

  const totalFare = baseFare + mileageFare + floorFare + largeItemFare;

  return {
    baseFare,
    mileageFare,
    floorFare,
    floorFareDetail,
    largeItemFare,
    totalFare,
  };
}

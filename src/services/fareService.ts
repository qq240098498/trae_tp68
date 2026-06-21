import type { VehicleType, VehiclePricing, FareDetail, FloorFareDetail, FloorFareSegment, LargeItem, SelectedLargeItem, LargeItemFareDetail } from '@/types';

export const LARGE_ITEMS: LargeItem[] = [
  {
    id: 'fridge',
    name: '冰箱',
    icon: 'Fridge',
    handlingFee: 80,
    weight: 0.08,
    volume: 1.5,
    description: '双开门/单开门冰箱',
  },
  {
    id: 'washing_machine',
    name: '洗衣机',
    icon: 'WashingMachine',
    handlingFee: 50,
    weight: 0.06,
    volume: 0.8,
    description: '滚筒/波轮洗衣机',
  },
  {
    id: 'sofa',
    name: '沙发',
    icon: 'Sofa',
    handlingFee: 100,
    weight: 0.1,
    volume: 3,
    description: '三人位/组合沙发',
  },
  {
    id: 'mattress',
    name: '床垫',
    icon: 'Bed',
    handlingFee: 60,
    weight: 0.03,
    volume: 1.2,
    description: '1.5米/1.8米床垫',
  },
  {
    id: 'piano',
    name: '钢琴',
    icon: 'Piano',
    handlingFee: 300,
    weight: 0.25,
    volume: 2,
    description: '立式/三角钢琴',
  },
  {
    id: 'bed',
    name: '床架',
    icon: 'BedDouble',
    handlingFee: 80,
    weight: 0.08,
    volume: 1.8,
    description: '实木/板式床架',
  },
  {
    id: 'wardrobe',
    name: '衣柜',
    icon: 'Wardrobe',
    handlingFee: 120,
    weight: 0.12,
    volume: 2.5,
    description: '实木/板式衣柜',
  },
  {
    id: 'tv',
    name: '电视',
    icon: 'Tv',
    handlingFee: 50,
    weight: 0.02,
    volume: 0.5,
    description: '55寸以上大屏电视',
  },
  {
    id: 'air_conditioner',
    name: '空调',
    icon: 'AirVent',
    handlingFee: 60,
    weight: 0.04,
    volume: 0.6,
    description: '柜机/挂机空调',
  },
  {
    id: 'dining_table',
    name: '餐桌',
    icon: 'Table',
    handlingFee: 70,
    weight: 0.06,
    volume: 1.5,
    description: '实木/玻璃餐桌',
  },
  {
    id: 'desk',
    name: '书桌',
    icon: 'Laptop',
    handlingFee: 50,
    weight: 0.04,
    volume: 1,
    description: '电脑桌/写字台',
  },
  {
    id: 'chair',
    name: '椅子',
    icon: 'Armchair',
    handlingFee: 30,
    weight: 0.015,
    volume: 0.5,
    description: '办公椅/餐椅',
  },
];

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

export function calculateFloorFare(
  floor: number,
  hasElevator: boolean,
  pricing: VehiclePricing,
): { total: number; segments: FloorFareSegment[] } {
  if (floor <= 1) return { total: 0, segments: [] };

  const chargeableFloors = floor - 1;

  if (hasElevator) {
    const price = pricing.floorPriceElevator;
    return {
      total: chargeableFloors * price,
      segments: [
        {
          label: '有电梯',
          floors: chargeableFloors,
          pricePerFloor: price,
          amount: chargeableFloors * price,
        },
      ],
    };
  }

  const segments: FloorFareSegment[] = [];
  let total = 0;

  const lowFloors = Math.min(floor, 4) - 1;
  if (lowFloors > 0) {
    const price = pricing.floorPriceNoElevatorLow;
    const amount = lowFloors * price;
    segments.push({ label: '2-4层', floors: lowFloors, pricePerFloor: price, amount });
    total += amount;
  }

  const midFloors = floor >= 5 ? Math.min(floor, 6) - 4 : 0;
  if (midFloors > 0) {
    const price = pricing.floorPriceNoElevatorMid;
    const amount = midFloors * price;
    segments.push({ label: '5-6层', floors: midFloors, pricePerFloor: price, amount });
    total += amount;
  }

  const highFloors = floor >= 7 ? floor - 6 : 0;
  if (highFloors > 0) {
    const price = pricing.floorPriceNoElevatorHigh;
    const amount = highFloors * price;
    segments.push({ label: '7层以上', floors: highFloors, pricePerFloor: price, amount });
    total += amount;
  }

  return { total, segments };
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
  largeItems?: SelectedLargeItem[];
}

export function calculateLargeItemFare(largeItems: SelectedLargeItem[], pricing: VehiclePricing): { total: number; detail: LargeItemFareDetail[] } {
  let total = 0;
  const detail: LargeItemFareDetail[] = [];

  for (const selected of largeItems) {
    const itemHandlingFee = Math.max(selected.item.handlingFee, pricing.largeItemPrice);
    const subtotal = itemHandlingFee * selected.quantity;
    total += subtotal;
    detail.push({
      itemId: selected.item.id,
      itemName: selected.item.name,
      quantity: selected.quantity,
      handlingFee: itemHandlingFee,
      subtotal,
    });
  }

  return { total, detail };
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
    largeItems,
  } = params;
  const pricing = VEHICLE_PRICING[vehicleType];

  const baseFare = pricing.baseFare;

  const mileageFare = distance > pricing.baseMileage
    ? (distance - pricing.baseMileage) * pricing.mileagePrice
    : 0;

  let floorFare = 0;
  let floorFareDetail: FloorFareDetail | undefined;

  if (needHandling) {
    const originResult = calculateFloorFare(originFloor, originHasElevator, pricing);
    const destResult = calculateFloorFare(destFloor, destHasElevator, pricing);
    floorFare = originResult.total + destResult.total;

    floorFareDetail = {
      origin: Math.max(0, originFloor - 1),
      dest: Math.max(0, destFloor - 1),
      originHasElevator,
      destHasElevator,
      originSegments: originResult.segments,
      destSegments: destResult.segments,
    };
  }

  let largeItemFare: number;
  let largeItemFareDetail: LargeItemFareDetail[] | undefined;

  if (largeItems && largeItems.length > 0) {
    const result = calculateLargeItemFare(largeItems, pricing);
    largeItemFare = result.total;
    largeItemFareDetail = result.detail;
  } else {
    largeItemFare = largeItemCount * pricing.largeItemPrice;
  }

  const totalFare = baseFare + mileageFare + floorFare + largeItemFare;

  return {
    baseFare,
    mileageFare,
    floorFare,
    floorFareDetail,
    largeItemFare,
    largeItemFareDetail,
    totalFare,
  };
}

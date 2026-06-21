export type VehicleType = 'van' | 'small_truck' | 'medium_truck' | 'large_truck';

export type OrderStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'arrived_pickup'
  | 'loading'
  | 'transporting'
  | 'arrived_delivery'
  | 'unloading'
  | 'completed'
  | 'cancelled';

export type DriverStatus = 'online' | 'offline' | 'busy' | 'resting';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  loadCapacity: number;
  volumeCapacity: number;
  color: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  orderCount: number;
  status: DriverStatus;
  vehicleId: string;
  vehicle?: Vehicle;
  currentLng: number;
  currentLat: number;
}

export interface FloorFareDetail {
  origin: number;
  dest: number;
  originHasElevator: boolean;
  destHasElevator: boolean;
  originPricePerFloor: number;
  destPricePerFloor: number;
}

export interface FareDetail {
  baseFare: number;
  mileageFare: number;
  floorFare: number;
  floorFareDetail?: FloorFareDetail;
  largeItemFare: number;
  totalFare: number;
}

export interface OrderLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  remark: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  cargoType: string;
  weight: number;
  volume: number;
  origin: string;
  originFloor: number;
  originHasElevator: boolean;
  destination: string;
  destFloor: number;
  destHasElevator: boolean;
  vehicleType: VehicleType;
  appointmentTime: Date;
  needHandling: boolean;
  largeItemCount: number;
  distance: number;
  totalFare: number;
  fareDetail: FareDetail;
  driverId?: string;
  driver?: Driver;
  driverLng?: number;
  driverLat?: number;
  eta?: number;
  isOverdue?: boolean;
  createdAt: Date;
  updatedAt: Date;
  logs: OrderLog[];
}

export interface VehiclePricing {
  type: VehicleType;
  name: string;
  baseFare: number;
  mileagePrice: number;
  baseMileage: number;
  floorPriceElevator: number;
  floorPriceNoElevatorLow: number;
  floorPriceNoElevatorMid: number;
  floorPriceNoElevatorHigh: number;
  largeItemPrice: number;
  loadCapacity: number;
  volumeCapacity: number;
  icon: string;
}

export interface LocationPoint {
  lng: number;
  lat: number;
}

export interface NewOrderForm {
  origin: string;
  originFloor: number;
  originHasElevator: boolean;
  destination: string;
  destFloor: number;
  destHasElevator: boolean;
  cargoType: string;
  weight: number;
  volume: number;
  vehicleType: VehicleType | null;
  appointmentTime: Date | null;
  needHandling: boolean;
  largeItemCount: number;
  distance: number;
}

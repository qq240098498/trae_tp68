import type { Vehicle } from '@/types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v001',
    plateNumber: '京A·12345',
    type: 'van',
    loadCapacity: 0.5,
    volumeCapacity: 3,
    color: '白色',
  },
  {
    id: 'v002',
    plateNumber: '京B·67890',
    type: 'small_truck',
    loadCapacity: 1,
    volumeCapacity: 6,
    color: '银色',
  },
  {
    id: 'v003',
    plateNumber: '京C·11111',
    type: 'medium_truck',
    loadCapacity: 2.5,
    volumeCapacity: 15,
    color: '蓝色',
  },
  {
    id: 'v004',
    plateNumber: '京D·22222',
    type: 'large_truck',
    loadCapacity: 5,
    volumeCapacity: 35,
    color: '红色',
  },
];

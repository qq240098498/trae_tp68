import { create } from 'zustand';
import type { Order, OrderStatus, NewOrderForm, SelectedLargeItem, LargeItemFareDetail } from '@/types';
import { mockOrders, mockDrivers } from '@/mock';
import { generateOrderNo } from '@/utils/format';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  selectedOrder: Order | null;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  createOrder: (orderData: NewOrderForm & { totalFare: number; fareDetail: Order['fareDetail'] }) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  assignDriver: (orderId: string, driverId: string) => Promise<void>;
  updateDriverLocation: (orderId: string, lng: number, lat: number) => Promise<void>;
  getPendingOrders: () => Order[];
  getActiveOrders: () => Order[];
  setSelectedOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  selectedOrder: null,

  fetchOrders: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ orders: [...mockOrders], loading: false });
  },

  getOrderById: (id: string) => {
    return get().orders.find((order) => order.id === id);
  },

  createOrder: async (orderData) => {
    const now = new Date();
    const newOrder: Order = {
      id: `o${Date.now()}`,
      orderNo: generateOrderNo(),
      status: 'pending',
      cargoType: orderData.cargoType,
      cargoScenario: orderData.cargoScenario,
      weight: orderData.weight,
      volume: orderData.volume,
      origin: orderData.origin,
      originFloor: orderData.originFloor,
      originHasElevator: orderData.originHasElevator,
      destination: orderData.destination,
      destFloor: orderData.destFloor,
      destHasElevator: orderData.destHasElevator,
      vehicleType: orderData.vehicleType!,
      appointmentTime: orderData.appointmentTime!,
      needHandling: orderData.needHandling,
      largeItemCount: orderData.largeItemCount,
      largeItems: orderData.largeItems,
      distance: orderData.distance,
      totalFare: orderData.totalFare,
      fareDetail: orderData.fareDetail,
      createdAt: now,
      updatedAt: now,
      logs: [
        {
          id: `l${Date.now()}`,
          orderId: `o${Date.now()}`,
          status: 'pending',
          remark: '订单创建成功',
          createdAt: now,
        },
      ],
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    return newOrder;
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const now = new Date();
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
              updatedAt: now,
              logs: [
                ...order.logs,
                {
                  id: `l${Date.now()}`,
                  orderId: id,
                  status,
                  remark: `状态更新为${status}`,
                  createdAt: now,
                },
              ],
            }
          : order
      ),
    }));
  },

  assignDriver: async (orderId: string, driverId: string) => {
    const driver = mockDrivers.find((d) => d.id === driverId);
    const now = new Date();
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'assigned',
              driverId,
              driver,
              driverLng: driver?.currentLng,
              driverLat: driver?.currentLat,
              updatedAt: now,
              logs: [
                ...order.logs,
                {
                  id: `l${Date.now()}`,
                  orderId,
                  status: 'assigned',
                  remark: `已指派司机${driver?.name}`,
                  createdAt: now,
                },
              ],
            }
          : order
      ),
    }));
  },

  updateDriverLocation: async (orderId: string, lng: number, lat: number) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              driverLng: lng,
              driverLat: lat,
            }
          : order
      ),
    }));
  },

  getPendingOrders: () => {
    return get().orders.filter((order) => order.status === 'pending');
  },

  getActiveOrders: () => {
    const activeStatuses: OrderStatus[] = [
      'assigned',
      'accepted',
      'arrived_pickup',
      'loading',
      'transporting',
      'arrived_delivery',
      'unloading',
    ];
    return get().orders.filter((order) => activeStatuses.includes(order.status));
  },

  setSelectedOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },
}));

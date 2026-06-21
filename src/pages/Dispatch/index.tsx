import { useEffect, useState, useMemo } from 'react';
import { Navigation, Award, Sparkles, Star, User, Clock, Package } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusTag from '@/components/StatusTag';
import { useOrderStore, useDriverStore } from '@/store';
import { formatMoney, formatDistance, formatDateTime } from '@/utils/format';
import type { Order, Driver, VehicleType } from '@/types';
import { cn } from '@/lib/utils';

const vehicleTypeNames: Record<VehicleType, string> = {
  van: '面包车',
  small_truck: '小货车',
  medium_truck: '中货车',
  large_truck: '大货车',
};

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

interface RecommendedDriver extends Driver {
  distance: number;
  todayOrders: number;
}

function OrderItem({ order, selected, onClick }: { order: Order; selected: boolean; onClick: () => void }) {
  return (
    <div
      className={cn(
        'cursor-pointer rounded-lg border p-4 transition-all',
        selected
          ? 'border-[#165DFF] bg-blue-50/50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-800">{order.orderNo}</span>
        <StatusTag status={order.status} />
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatDateTime(order.appointmentTime)}</span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500"></div>
          <span className="flex-1 text-sm text-gray-700 line-clamp-1">{order.origin}</span>
        </div>
        <div className="ml-1 h-4 w-px border-l border-dashed border-gray-300"></div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500"></div>
          <span className="flex-1 text-sm text-gray-700 line-clamp-1">{order.destination}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">
          {vehicleTypeNames[order.vehicleType]}
        </span>
        <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">
          {formatDistance(order.distance)}
        </span>
        <span className="text-[#165DFF] font-medium">{formatMoney(order.totalFare)}</span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        {order.needHandling && (
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            需搬运
          </span>
        )}
        {order.largeItemCount > 0 && (
          <span>大件 {order.largeItemCount} 件</span>
        )}
      </div>
    </div>
  );
}

function DriverRecommendCard({ driver, rank, onDispatch }: { driver: RecommendedDriver; rank: number; onDispatch: () => void }) {
  const showMedal = rank >= 0 && rank < 3;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-4 hover:border-[#165DFF]/50 hover:shadow-sm transition-all">
      {showMedal && (
        <div className="absolute -left-1 -top-1">
          <Award className={cn('h-6 w-6', medalColors[rank])} />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <User className="h-6 w-6 text-gray-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">{driver.name}</h4>
            <span className="text-sm text-[#165DFF]">{formatDistance(driver.distance)}</span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-700">{driver.rating}</span>
            </div>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">今日 {driver.todayOrders} 单</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5">
              {driver.vehicle ? vehicleTypeNames[driver.vehicle.type] : '未知车型'}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5">
              {driver.vehicle?.plateNumber || '未知车牌'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
              driver.status === 'online' ? 'bg-green-100 text-green-600' :
              driver.status === 'busy' ? 'bg-orange-100 text-orange-600' :
              driver.status === 'resting' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            )}>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                driver.status === 'online' ? 'bg-green-500' :
                driver.status === 'busy' ? 'bg-orange-500' :
                driver.status === 'resting' ? 'bg-blue-500' :
                'bg-gray-500'
              )}></span>
              {driver.status === 'online' ? '在线' :
               driver.status === 'busy' ? '繁忙' :
               driver.status === 'resting' ? '休息' : '离线'}
            </span>

            <Button
              size="sm"
              variant="primary"
              onClick={onDispatch}
              disabled={driver.status === 'offline'}
            >
              派单
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dispatch() {
  const { orders, loading: ordersLoading, fetchOrders, assignDriver, selectedOrder, setSelectedOrder } = useOrderStore();
  const { drivers, loading: driversLoading, fetchDrivers } = useDriverStore();
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [fetchOrders, fetchDrivers]);

  const pendingOrders = useMemo(() => {
    return orders.filter(order => order.status === 'pending');
  }, [orders]);

  const recommendedDrivers = useMemo<RecommendedDriver[]>(() => {
    if (!selectedOrder) return [];

    const available = drivers.filter(
      d => d.status === 'online' && d.vehicle?.type === selectedOrder.vehicleType
    );

    return available.map(driver => {
      const distance = Math.random() * 5 + 0.5;
      const todayOrders = Math.floor(Math.random() * 8) + 1;
      return {
        ...driver,
        distance,
        todayOrders,
      };
    }).sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance;
      }
      return b.rating - a.rating;
    });
  }, [selectedOrder, drivers, sortBy]);

  const handleDispatch = (driverId: string) => {
    if (selectedOrder) {
      assignDriver(selectedOrder.id, driverId);
      setSelectedOrder(null);
    }
  };

  const handleSmartDispatch = () => {
    if (selectedOrder && recommendedDrivers.length > 0) {
      assignDriver(selectedOrder.id, recommendedDrivers[0].id);
      setSelectedOrder(null);
    }
  };

  const loading = ordersLoading || driversLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">派单中心</h1>
        <p className="mt-2 text-gray-500">智能派单与调度</p>
      </div>

      <div className="flex gap-6">
        <Card className="flex-[55_55_0%]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-800">待派单列表</h3>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                {pendingOrders.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#165DFF] border-t-transparent"></div>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              暂无待派订单
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
              {pendingOrders.map(order => (
                <OrderItem
                  key={order.id}
                  order={order}
                  selected={selectedOrder?.id === order.id}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="flex-[45_45_0%]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">推荐司机</h3>
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
              <button
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  sortBy === 'distance' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
                onClick={() => setSortBy('distance')}
              >
                <span className="flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  距离优先
                </span>
              </button>
              <button
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  sortBy === 'rating' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
                onClick={() => setSortBy('rating')}
              >
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  评分优先
                </span>
              </button>
            </div>
          </div>

          {!selectedOrder ? (
            <div className="py-20 text-center text-gray-500">
              请先选择左侧订单
            </div>
          ) : recommendedDrivers.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              暂无匹配的司机
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={handleSmartDispatch}
                >
                  一键智能派单
                </Button>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
                {recommendedDrivers.map((driver, index) => (
                  <DriverRecommendCard
                    key={driver.id}
                    driver={driver}
                    rank={index}
                    onDispatch={() => handleDispatch(driver.id)}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

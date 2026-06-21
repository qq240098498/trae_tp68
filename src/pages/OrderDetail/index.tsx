import { useEffect, useState, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Package,
  Phone,
  Star,
  Truck,
  Clock,
  User,
  Calendar,
  Layers,
  Ruler,
  Building2,
  CheckCircle,
  Play,
  Send,
  PackageCheck,
  ChevronRight,
  Home,
  ShoppingBag,
  Utensils,
  Wine,
  AlertTriangle,
  Grip,
  Route,
  TrendingUp,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { useDriverStore } from '@/store/useDriverStore';
import Card from '@/components/Card';
import StatusTag from '@/components/StatusTag';
import Button from '@/components/Button';
import SimpleMap from '@/components/Map/SimpleMap';
import Empty from '@/components/Empty';
import { formatMoney, formatDateTime, formatDistance } from '@/utils/format';
import { mockVehicles } from '@/mock/vehicles';
import { cn } from '@/lib/utils';
import { formatMatchScore } from '@/services/backhaulService';
import type { OrderStatus, VehicleType, CargoScenario, BackhaulMatchResult } from '@/types';

const vehicleTypeNames: Record<VehicleType, string> = {
  van: '面包车',
  small_truck: '小货车',
  medium_truck: '中货车',
  large_truck: '大货车',
};

const scenarioIconMap: Record<string, typeof Home> = {
  '普通货物': Package,
  '家具家电': ShoppingBag,
  '建材': Grip,
  '食品': Utensils,
  '易碎品': AlertTriangle,
  '搬家': Home,
  '其他': Wine,
};

const getItemIcon = (iconName: string) => {
  const iconMap: Record<string, typeof Home> = {
    Fridge: Home,
    WashingMachine: Package,
    Sofa: Home,
    Bed: Package,
    Piano: ShoppingBag,
    BedDouble: Home,
    Wardrobe: Package,
    Tv: ShoppingBag,
    AirVent: AlertTriangle,
    Table: Grip,
    Laptop: ShoppingBag,
    Armchair: Home,
  };
  return iconMap[iconName] || Package;
};

const statusActionMap: Record<OrderStatus, OrderStatus | null> = {
  pending: 'assigned',
  assigned: 'accepted',
  accepted: 'arrived_pickup',
  arrived_pickup: 'loading',
  loading: 'transporting',
  transporting: 'arrived_delivery',
  arrived_delivery: 'unloading',
  unloading: 'completed',
  completed: null,
  cancelled: null,
};

const actionButtonConfig: Partial<Record<OrderStatus, { label: string; icon: ComponentType<{ className?: string }>; variant: 'primary' | 'outline' }>> = {
  pending: { label: '立即派单', icon: Send, variant: 'primary' },
  assigned: { label: '确认接单', icon: CheckCircle, variant: 'primary' },
  accepted: { label: '到达提货点', icon: MapPin, variant: 'primary' },
  arrived_pickup: { label: '开始装货', icon: Package, variant: 'primary' },
  loading: { label: '开始运输', icon: Play, variant: 'primary' },
  transporting: { label: '到达收货点', icon: MapPin, variant: 'primary' },
  arrived_delivery: { label: '开始卸货', icon: Package, variant: 'primary' },
  unloading: { label: '确认签收', icon: PackageCheck, variant: 'primary' },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    orders,
    fetchOrders,
    getOrderById,
    updateOrderStatus,
    assignDriver,
    loading,
    backhaulRecommendations,
    backhaulLoading,
    searchBackhaulForOrder,
  } = useOrderStore();
  const { fetchDrivers, getAvailableDrivers } = useDriverStore();
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [backhaulSearched, setBackhaulSearched] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [fetchOrders, fetchDrivers]);

  const order = getOrderById(id || '');

  useEffect(() => {
    if (order && order.status === 'completed' && !backhaulSearched) {
      searchBackhaulForOrder(order.id);
      setBackhaulSearched(true);
    }
  }, [order, backhaulSearched, searchBackhaulForOrder]);

  const vehicle = useMemo(() => {
    if (order?.driver?.vehicleId) {
      return mockVehicles.find((v) => v.id === order.driver?.vehicleId);
    }
    return null;
  }, [order?.driver?.vehicleId]);

  const handleStatusUpdate = () => {
    if (!order) return;
    const nextStatus = statusActionMap[order.status];
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
      if (nextStatus === 'completed') {
        setTimeout(() => {
          searchBackhaulForOrder(order.id);
          setBackhaulSearched(true);
        }, 500);
      }
    }
  };

  const handleAssignDriver = (driverId: string) => {
    if (!order) return;
    assignDriver(order.id, driverId);
    setShowDriverModal(false);
  };

  const actionConfig = order ? actionButtonConfig[order.status] : null;

  if (loading || !orders.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <Empty description="加载中..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-16">
        <Empty description="订单不存在" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-800">{order.orderNo}</h1>
              <StatusTag status={order.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">订单详情</p>
          </div>
        </div>

        {actionConfig && (
          <div className="flex items-center gap-2">
            {order.status === 'pending' && (
              <Button
                variant="outline"
                onClick={() => setShowDriverModal(true)}
                icon={<User className="h-4 w-4" />}
              >
                选择司机
              </Button>
            )}
            <Button
              icon={<actionConfig.icon className="h-4 w-4" />}
              onClick={order.status === 'pending' ? () => setShowDriverModal(true) : handleStatusUpdate}
            >
              {actionConfig.label}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="地址信息">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="my-1 h-10 w-px bg-gray-200" />
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-green-600">起点</span>
                      {order.originFloor > 1 && (
                        <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-600">
                          {order.originFloor}楼
                        </span>
                      )}
                      <span className={cn(
                        'rounded px-2 py-0.5 text-xs',
                        order.originHasElevator
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600'
                      )}>
                        {order.originHasElevator ? '有电梯' : '无电梯'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">{order.origin}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-red-600">终点</span>
                      {order.destFloor > 1 && (
                        <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">
                          {order.destFloor}楼
                        </span>
                      )}
                      <span className={cn(
                        'rounded px-2 py-0.5 text-xs',
                        order.destHasElevator
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600'
                      )}>
                        {order.destHasElevator ? '有电梯' : '无电梯'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">{order.destination}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  全程 <span className="font-semibold">{formatDistance(order.distance)}</span>
                </span>
              </div>
            </div>
          </Card>

          <Card title="货物信息">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const ScenarioIcon = scenarioIconMap[order.cargoType] || Package;
                    return <ScenarioIcon className="h-4 w-4 text-gray-500" />;
                  })()}
                  <span className="text-xs text-gray-500">使用场景</span>
                </div>
                <p className="mt-2 text-base font-semibold text-gray-900">{order.cargoType}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">重量</span>
                </div>
                <p className="mt-2 text-base font-semibold text-gray-900">{order.weight} 吨</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">体积</span>
                </div>
                <p className="mt-2 text-base font-semibold text-gray-900">{order.volume} m³</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">大件数量</span>
                </div>
                <p className="mt-2 text-base font-semibold text-gray-900">{order.largeItemCount} 件</p>
              </div>
            </div>

            {order.largeItems && order.largeItems.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">大件物品清单</h4>
                <div className="rounded-lg border border-gray-200 bg-blue-50/50 p-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {order.largeItems.map((selected) => {
                      const ItemIcon = getItemIcon(selected.item.icon);
                      return (
                        <div
                          key={selected.item.id}
                          className="flex items-center gap-2 rounded-lg bg-white p-2"
                        >
                          <ItemIcon className="h-4 w-4 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {selected.item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              × {selected.quantity} 件
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-100/50 px-3 py-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      请司机提前确认配载空间，准备搬运工具
                    </span>
                  </div>
                </div>
              </div>
            )}

            {order.needHandling && (
              <div className="mt-4 rounded-lg bg-orange-50 p-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700">需要搬运服务</span>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-400" />
                <span>车型：{vehicleTypeNames[order.vehicleType]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>预约：{formatDateTime(order.appointmentTime)}</span>
              </div>
            </div>
          </Card>

          <Card title="费用明细">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">起步价</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatMoney(order.fareDetail.baseFare)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">里程费</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatMoney(order.fareDetail.mileageFare)}
                </span>
              </div>
              {order.fareDetail.floorFareDetail ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      楼层费
                      <span className="ml-1 text-xs text-gray-400">
                        (起点{order.fareDetail.floorFareDetail.originHasElevator ? '有电梯' : '无电梯'} × {order.fareDetail.floorFareDetail.origin}层 +
                         终点{order.fareDetail.floorFareDetail.destHasElevator ? '有电梯' : '无电梯'} × {order.fareDetail.floorFareDetail.dest}层)
                      </span>
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatMoney(order.fareDetail.floorFare)}
                    </span>
                  </div>
                  {order.fareDetail.floorFareDetail.originSegments.map((seg, idx) => (
                    <div key={`o-${idx}`} className="flex justify-between text-xs text-gray-400 pl-2">
                      <span>起点{seg.label}: {seg.floors}层 × {formatMoney(seg.pricePerFloor)}/层</span>
                      <span>{formatMoney(seg.amount)}</span>
                    </div>
                  ))}
                  {order.fareDetail.floorFareDetail.destSegments.map((seg, idx) => (
                    <div key={`d-${idx}`} className="flex justify-between text-xs text-gray-400 pl-2">
                      <span>终点{seg.label}: {seg.floors}层 × {formatMoney(seg.pricePerFloor)}/层</span>
                      <span>{formatMoney(seg.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">楼层费</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatMoney(order.fareDetail.floorFare)}
                  </span>
                </div>
              )}
              {order.fareDetail.largeItemFareDetail && order.fareDetail.largeItemFareDetail.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">大件费</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatMoney(order.fareDetail.largeItemFare)}
                    </span>
                  </div>
                  {order.fareDetail.largeItemFareDetail.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-xs text-gray-400 pl-2">
                      <span>{item.itemName}: {item.quantity}件 × {formatMoney(item.handlingFee)}/件</span>
                      <span>{formatMoney(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">大件费</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatMoney(order.fareDetail.largeItemFare)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">总计</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatMoney(order.fareDetail.totalFare)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="操作记录">
            <div className="relative">
              <div className="absolute left-3 top-0 h-full w-px bg-gray-200" />
              <div className="space-y-4">
                {order.logs
                  .slice()
                  .reverse()
                  .map((log, index) => (
                    <div key={log.id} className="relative flex items-start gap-4 pl-8">
                      <div
                        className={`absolute left-0 flex h-6 w-6 items-center justify-center rounded-full ${
                          index === 0
                            ? 'bg-blue-500 ring-4 ring-blue-100'
                            : 'bg-gray-300'
                        }`}
                      >
                        {index === 0 && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <StatusTag status={log.status} />
                          <span className="text-xs text-gray-400">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{log.remark}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="司机信息">
            {order.driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{order.driver.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{order.driver.rating}分</span>
                      </div>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-400">{order.driver.orderCount}单</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{order.driver.phone}</span>
                  </div>
                  {vehicle && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span>{vehicle.plateNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{vehicleTypeNames[vehicle.type]}</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  icon={<Phone className="h-4 w-4" />}
                >
                  联系司机
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400">
                <User className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm">暂无司机信息</p>
                {order.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowDriverModal(true)}
                  >
                    指派司机
                  </Button>
                )}
              </div>
            )}
          </Card>

          <Card title="实时位置">
            <div className="h-64">
              {order.driverLng && order.driverLat ? (
                <SimpleMap
                  driverPosition={{ lng: order.driverLng, lat: order.driverLat }}
                  origin={{ lng: 116.4074, lat: 39.9042 }}
                  destination={{ lng: 116.4574, lat: 39.9242 }}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                  <MapPin className="h-8 w-8" />
                  <span className="ml-2 text-sm">暂无位置信息</span>
                </div>
              )}
            </div>
            {order.eta && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">
                    预计 {order.eta} 分钟后到达
                  </span>
                </div>
              </div>
            )}
          </Card>

          {order.status === 'completed' && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-green-600" />
                  <span>回程订单推荐</span>
                </div>
              }
            >
              {backhaulLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">正在智能匹配...</span>
                </div>
              ) : backhaulRecommendations.length === 0 ? (
                <div className="py-6 text-center">
                  <Route className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">暂无顺路回程订单</p>
                  <Link to="/backhaul">
                    <Button variant="outline" size="sm" className="mt-3">
                      查看更多
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {backhaulRecommendations.slice(0, 3).map((recommendation) => {
                    const { order: backhaulOrder, matchScore, estimatedSavings } = recommendation;
                    const matchInfo = formatMatchScore(matchScore);
                    return (
                      <div
                        key={backhaulOrder.id}
                        className="rounded-lg border border-gray-200 p-3 hover:border-green-300 hover:bg-green-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/orders/${backhaulOrder.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              matchScore >= 60 ? 'bg-green-100' : 'bg-blue-100'
                            )}>
                              <TrendingUp className={cn(
                                'h-4 w-4',
                                matchScore >= 60 ? 'text-green-600' : 'text-blue-600'
                              )} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{backhaulOrder.orderNo}</p>
                              <p className={cn('text-xs font-medium', matchInfo.color)}>
                                {matchInfo.level} · {matchScore}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-orange-500">{formatMoney(backhaulOrder.totalFare)}</p>
                            <p className="text-xs text-green-600">省{formatMoney(estimatedSavings)}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span className="truncate">{backhaulOrder.origin}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span className="truncate">{backhaulOrder.destination}</span>
                        </div>
                      </div>
                    );
                  })}
                  {backhaulRecommendations.length > 3 && (
                    <Link to="/backhaul" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        查看全部 {backhaulRecommendations.length} 条推荐
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          )}

          {actionConfig && (
            <Card>
              <Button
                className="w-full"
                icon={<actionConfig.icon className="h-4 w-4" />}
                onClick={order.status === 'pending' ? () => setShowDriverModal(true) : handleStatusUpdate}
              >
                {actionConfig.label}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>
          )}
        </div>
      </div>

      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">选择司机</h3>
            <p className="mt-1 text-sm text-gray-500">请选择一位空闲的司机</p>

            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {getAvailableDrivers().length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  暂无空闲司机
                </div>
              ) : (
                getAvailableDrivers().map((driver) => {
                  const v = mockVehicles.find((veh) => veh.id === driver.vehicleId);
                  return (
                    <button
                      key={driver.id}
                      onClick={() => handleAssignDriver(driver.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-500">{driver.rating}分</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-400">{driver.orderCount}单</span>
                        </div>
                        {v && (
                          <div className="mt-1 text-xs text-gray-400">
                            {v.plateNumber} · {vehicleTypeNames[v.type]}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setShowDriverModal(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

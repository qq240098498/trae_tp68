import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  MapPin,
  Truck,
  Clock,
  TrendingUp,
  DollarSign,
  Route,
  Target,
  ChevronRight,
  Search,
  Filter,
  Zap,
  ArrowRight,
  Users,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { useDriverStore } from '@/store/useDriverStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusTag from '@/components/StatusTag';
import Empty from '@/components/Empty';
import { formatMoney, formatDistance, formatDateTime } from '@/utils/format';
import { formatMatchScore } from '@/services/backhaulService';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/types';

const vehicleTypeNames: Record<VehicleType, string> = {
  van: '面包车',
  small_truck: '小货车',
  medium_truck: '中货车',
  large_truck: '大货车',
};

export default function Backhaul() {
  const navigate = useNavigate();
  const { orders, fetchOrders, backhaulRecommendations, backhaulLoading, searchBackhaulForDriver, clearBackhaulRecommendations } = useOrderStore();
  const { drivers, fetchDrivers } = useDriverStore();
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [fetchOrders, fetchDrivers]);

  useEffect(() => {
    if (selectedDriverId) {
      searchBackhaulForDriver(selectedDriverId);
    } else {
      clearBackhaulRecommendations();
    }
  }, [selectedDriverId, searchBackhaulForDriver, clearBackhaulRecommendations]);

  const driverCompletedOrders = useMemo(() => {
    if (!selectedDriverId) return [];
    return orders.filter(
      (o) => o.driverId === selectedDriverId && o.status === 'completed'
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [orders, selectedDriverId]);

  const filteredRecommendations = useMemo(() => {
    return backhaulRecommendations.filter((r) => r.matchScore >= minMatchScore);
  }, [backhaulRecommendations, minMatchScore]);

  const totalSavings = useMemo(() => {
    return backhaulRecommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);
  }, [backhaulRecommendations]);

  const handleRefresh = () => {
    if (selectedDriverId) {
      searchBackhaulForDriver(selectedDriverId);
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleAcceptOrder = (orderId: string, driverId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const driverOptions = useMemo(() => {
    return drivers.filter((d) => d.status === 'online' || d.status === 'busy');
  }, [drivers]);

  const latestCompletedOrder = driverCompletedOrders[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">回程带货</h1>
          <p className="mt-1 text-sm text-gray-500">智能推荐顺路订单，减少空驶，降低成本</p>
        </div>
        <Button
          variant="outline"
          icon={<RefreshCw className={cn('h-4 w-4', backhaulLoading && 'animate-spin')} />}
          onClick={handleRefresh}
          disabled={!selectedDriverId || backhaulLoading}
        >
          刷新推荐
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">推荐订单</p>
            <p className="text-2xl font-bold text-gray-800">{backhaulRecommendations.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">预计节省</p>
            <p className="text-2xl font-bold text-green-600">{formatMoney(totalSavings)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <Route className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">平均匹配度</p>
            <p className="text-2xl font-bold text-orange-600">
              {backhaulRecommendations.length > 0
                ? Math.round(backhaulRecommendations.reduce((sum, r) => sum + r.matchScore, 0) / backhaulRecommendations.length)
                : 0}%
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">完成订单</p>
            <p className="text-2xl font-bold text-purple-600">{driverCompletedOrders.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card title="选择司机">
            <div className="space-y-3">
              {driverOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  暂无在线司机
                </div>
              ) : (
                driverOptions.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                      selectedDriverId === driver.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{driver.name}</p>
                      <p className="text-xs text-gray-500">{vehicleTypeNames[driver.vehicle?.type || 'van']}</p>
                    </div>
                    <div className={cn(
                      'h-2 w-2 rounded-full',
                      driver.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                    )} />
                  </button>
                ))
              )}
            </div>

            {latestCompletedOrder && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="mb-2 text-xs font-medium text-gray-500">最近完成订单</h4>
                <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-1">{latestCompletedOrder.origin}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-1">{latestCompletedOrder.destination}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">{formatDistance(latestCompletedOrder.distance)}</span>
                    <span className="text-xs font-medium text-orange-500">{formatMoney(latestCompletedOrder.totalFare)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card title="筛选条件" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>最低匹配度</span>
                  <span className="text-blue-600">{minMatchScore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>推荐顺路订单</span>
                <span className="text-sm font-normal text-gray-500">
                  共 {filteredRecommendations.length} 条推荐
                </span>
              </div>
            }
          >
            {backhaulLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-500">正在智能匹配顺路订单...</span>
              </div>
            ) : !selectedDriverId ? (
              <div className="py-16">
                <Empty description="请选择一位司机查看回程订单推荐" icon={<Route className="h-12 w-12 text-gray-300" />} />
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="py-16">
                <Empty description="暂无符合条件的顺路订单" icon={<Search className="h-12 w-12 text-gray-300" />} />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.map((recommendation) => {
                  const { order, matchScore, detourDistance, originDistance, estimatedSavings, timeMatch } = recommendation;
                  const matchInfo = formatMatchScore(matchScore);

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl',
                            matchScore >= 80 ? 'bg-green-100' :
                            matchScore >= 60 ? 'bg-blue-100' :
                            matchScore >= 40 ? 'bg-yellow-100' : 'bg-orange-100'
                          )}>
                            <TrendingUp className={cn(
                              'h-6 w-6',
                              matchScore >= 80 ? 'text-green-600' :
                              matchScore >= 60 ? 'text-blue-600' :
                              matchScore >= 40 ? 'text-yellow-600' : 'text-orange-600'
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-gray-800">{order.orderNo}</h3>
                              <StatusTag status={order.status} />
                              <span className={cn('text-sm font-medium', matchInfo.color)}>
                                {matchInfo.level} · {matchScore}%
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {order.cargoType} · {vehicleTypeNames[order.vehicleType]}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-500">{formatMoney(order.totalFare)}</p>
                          <p className="text-xs text-green-600">预计节省 {formatMoney(estimatedSavings)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{order.origin}</p>
                              <p className="text-xs text-gray-400">
                                {order.originFloor}楼 {order.originHasElevator ? '有电梯' : '无电梯'}
                              </p>
                            </div>
                          </div>
                          <div className="ml-1 flex items-center gap-2 text-xs text-gray-400">
                            <ArrowRight className="h-3 w-3" />
                            <span>距完成目的地 {formatDistance(originDistance)}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{order.destination}</p>
                              <p className="text-xs text-gray-400">
                                {order.destFloor}楼 {order.destHasElevator ? '有电梯' : '无电梯'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="w-px bg-gray-100" />

                        <div className="w-40 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">绕行距离</span>
                            <span className="font-medium text-gray-700">{formatDistance(detourDistance)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">运输距离</span>
                            <span className="font-medium text-gray-700">{formatDistance(order.distance)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">时间匹配</span>
                            <span className="font-medium text-gray-700">差 {timeMatch}h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">货物重量</span>
                            <span className="font-medium text-gray-700">{order.weight} 吨</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDateTime(order.appointmentTime)}</span>
                          </div>
                          {order.needHandling && (
                            <span className="rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-600">
                              需要搬运
                            </span>
                          )}
                          {order.largeItemCount > 0 && (
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                              {order.largeItemCount}件大件
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            查看详情
                          </Button>
                          <Button
                            size="sm"
                            icon={<Zap className="h-4 w-4" />}
                            onClick={() => handleAcceptOrder(order.id, selectedDriverId)}
                          >
                            一键接单
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

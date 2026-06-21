import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Plus,
  Users,
  Calculator,
  ArrowUpRight,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusTag from '@/components/StatusTag';
import SimpleMap from '@/components/Map/SimpleMap';
import { formatMoney, formatDistance } from '@/utils/format';
import type { VehicleType } from '@/types';

const vehicleTypeNames: Record<VehicleType, string> = {
  van: '面包车',
  small_truck: '小货车',
  medium_truck: '中货车',
  large_truck: '大货车',
};

const stats = [
  {
    label: '今日订单',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: '待派单',
    icon: Clock,
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    label: '运输中',
    icon: Truck,
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: '已完成',
    icon: CheckCircle,
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

const quickActions = [
  { label: '快速下单', icon: Plus, path: '/orders/new', color: 'bg-blue-500' },
  { label: '批量派单', icon: Users, path: '/dispatch', color: 'bg-green-500' },
  { label: '运费计算', icon: Calculator, path: '/calculator', color: 'bg-orange-500' },
  { label: '司机管理', icon: Users, path: '/drivers', color: 'bg-purple-500' },
];

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const mockWeekData = [12, 18, 15, 22, 28, 16, 20];

export default function Dashboard() {
  const { orders, fetchOrders, getPendingOrders, getActiveOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const todayOrders = orders.length;
  const pendingOrders = getPendingOrders();
  const activeOrders = getActiveOrders();
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const statValues = [todayOrders, pendingOrders.length, activeOrders.length, completedOrders.length];
  const statTrends = [12, -5, 8, 15];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">工作台</h1>
        <p className="mt-1 text-sm text-gray-500">欢迎使用同城货运管理系统</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl p-5 ${stat.bg}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">{statValues[index]}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <ArrowUpRight
                className={`h-4 w-4 ${statTrends[index] >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`}
              />
              <span
                className={`text-sm font-medium ${
                  statTrends[index] >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {statTrends[index] >= 0 ? '+' : ''}
                {statTrends[index]}%
              </span>
              <span className="text-sm text-gray-500">较昨日</span>
            </div>
          </div>
        ))}
      </div>

      <Card title="快捷操作">
        <div className="flex flex-wrap items-center gap-8">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${action.color} text-white shadow-lg shadow-blue-500/20`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm text-gray-600">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title={
            <div className="flex items-center justify-between">
              <span>待派单</span>
              <Link to="/orders?status=pending" className="text-sm text-blue-600 hover:underline">
                查看全部
              </Link>
            </div>
          }
        >
          <div className="space-y-4">
            {pendingOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{order.orderNo}</span>
                    <StatusTag status={order.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{order.origin}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                    <span>{vehicleTypeNames[order.vehicleType]}</span>
                    <span>{formatDistance(order.distance)}</span>
                    <span className="font-medium text-blue-600">{formatMoney(order.totalFare)}</span>
                  </div>
                </div>
                <Link to={`/orders/${order.id}`}>
                  <Button size="sm" variant="outline">
                    去派单
                  </Button>
                </Link>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                <Clock className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm">暂无待派单</p>
              </div>
            )}
          </div>
        </Card>

        <Card
          title={
            <div className="flex items-center justify-between">
              <span>在途订单</span>
              <Link to="/tracking" className="text-sm text-blue-600 hover:underline">
                查看全部
              </Link>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="h-48 rounded-lg bg-gray-50">
              {activeOrders.length > 0 && activeOrders[0].driverLng ? (
                <SimpleMap
                  driverPosition={{
                    lng: activeOrders[0].driverLng!,
                    lat: activeOrders[0].driverLat!,
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <Truck className="h-8 w-8" />
                  <span className="ml-2 text-sm">暂无在途订单</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {order.orderNo}
                      </span>
                      <StatusTag status={order.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{order.origin}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="近7日订单趋势">
        <div className="flex h-64 items-end gap-4 px-4">
          {mockWeekData.map((value, index) => {
            const maxValue = Math.max(...mockWeekData);
            const heightPercent = (value / maxValue) * 100;
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-600">{value}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                />
                <span className="text-xs text-gray-500">{weekDays[index]}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

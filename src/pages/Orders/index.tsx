import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MapPin,
  Truck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusTag from '@/components/StatusTag';
import { formatMoney, formatDistance, formatDateTime } from '@/utils/format';
import type { OrderStatus, VehicleType } from '@/types';

const vehicleTypeNames: Record<VehicleType, string> = {
  van: '面包车',
  small_truck: '小货车',
  medium_truck: '中货车',
  large_truck: '大货车',
};

const statusTabs: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待派单' },
  { key: 'assigned', label: '已派单' },
  { key: 'transporting', label: '运输中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const PAGE_SIZE = 6;

export default function Orders() {
  const { orders, fetchOrders } = useOrderStore();
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeStatus !== 'all' && order.status !== activeStatus) {
        return false;
      }
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          order.orderNo.toLowerCase().includes(search) ||
          order.origin.toLowerCase().includes(search) ||
          order.destination.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [orders, activeStatus, searchText]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleStatusChange = (status: OrderStatus | 'all') => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">订单管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理所有货运订单</p>
        </div>
        <Link to="/orders/new">
          <Button icon={<Plus className="h-4 w-4" />}>新建订单</Button>
        </Link>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeStatus === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号、地址..."
                value={searchText}
                onChange={handleSearch}
                className="w-64 rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedOrders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card className="h-full hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    {order.orderNo}
                  </span>
                  <StatusTag status={order.status} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm text-gray-600 line-clamp-1">
                      {order.origin}
                    </span>
                  </div>
                  <div className="ml-2 h-4 w-px bg-gray-200" />
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    <span className="text-sm text-gray-600 line-clamp-1">
                      {order.destination}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    <span>{vehicleTypeNames[order.vehicleType]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{formatDistance(order.distance)}</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatMoney(order.totalFare)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>预约：{formatDateTime(order.appointmentTime)}</span>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" variant="outline">
                    查看详情
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {paginatedOrders.length === 0 && (
        <Card>
          <div className="py-12 text-center text-gray-400">
            <Search className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm">暂无订单数据</p>
          </div>
        </Card>
      )}

      {totalPages > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

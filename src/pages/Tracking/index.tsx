import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  Users,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import type { Order, LocationPoint } from '@/types';
import { formatDuration } from '@/utils/format';
import { cn } from '@/lib/utils';
import SimpleMap from '@/components/Map/SimpleMap';

export default function Tracking() {
  const { orders, fetchOrders, getActiveOrders, updateDriverLocation, selectedOrder, setSelectedOrder } =
    useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [driverPositions, setDriverPositions] = useState<Record<string, LocationPoint>>({});

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const activeOrders = useMemo(() => {
    return getActiveOrders().filter((order) => {
      if (!order.driverId || order.driverLng === undefined || order.driverLat === undefined) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.orderNo.toLowerCase().includes(query) ||
          order.driver?.name.toLowerCase().includes(query) ||
          order.origin.toLowerCase().includes(query) ||
          order.destination.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [orders, getActiveOrders, searchQuery]);

  useEffect(() => {
    const positions: Record<string, LocationPoint> = {};
    activeOrders.forEach((order) => {
      if (order.driverLng !== undefined && order.driverLat !== undefined) {
        positions[order.id] = {
          lng: order.driverLng,
          lat: order.driverLat,
        };
      }
    });
    setDriverPositions(positions);
  }, [activeOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPositions((prev) => {
        const newPositions = { ...prev };
        Object.keys(newPositions).forEach((orderId) => {
          const pos = newPositions[orderId];
          if (pos) {
            const lngOffset = (Math.random() - 0.5) * 0.002;
            const latOffset = (Math.random() - 0.5) * 0.002;
            newPositions[orderId] = {
              lng: pos.lng + lngOffset,
              lat: pos.lat + latOffset,
            };
            updateDriverLocation(orderId, pos.lng + lngOffset, pos.lat + latOffset);
          }
        });
        return newPositions;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [updateDriverLocation]);

  const handleSelectOrder = useCallback(
    (order: Order) => {
      setSelectedOrder(order);
    },
    [setSelectedOrder]
  );

  const allDriverPositions = useMemo(() => {
    return Object.values(driverPositions);
  }, [driverPositions]);

  const selectedDriverPosition = useMemo(() => {
    if (!selectedOrder) return undefined;
    return driverPositions[selectedOrder.id];
  }, [selectedOrder, driverPositions]);

  const getAddressSummary = (address: string) => {
    return address.length > 20 ? address.substring(0, 20) + '...' : address;
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap: Record<string, string> = {
      assigned: '已派单',
      accepted: '已接单',
      arrived_pickup: '已到达',
      loading: '装货中',
      transporting: '运输中',
      arrived_delivery: '已送达',
      unloading: '卸货中',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: Order['status']) => {
    const colorMap: Record<string, string> = {
      assigned: 'text-blue-600 bg-blue-100',
      accepted: 'text-blue-600 bg-blue-100',
      arrived_pickup: 'text-cyan-600 bg-cyan-100',
      loading: 'text-cyan-600 bg-cyan-100',
      transporting: 'text-green-600 bg-green-100',
      arrived_delivery: 'text-purple-600 bg-purple-100',
      unloading: 'text-purple-600 bg-purple-100',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">实时追踪</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单号、司机、地址..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#165DFF] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">实时地图</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  在途司机 {activeOrders.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            {selectedOrder && selectedDriverPosition ? (
              <SimpleMap
                driverPosition={selectedDriverPosition}
                origin={{ lng: 116.4039, lat: 39.9245 }}
                destination={{ lng: 116.4567, lat: 39.9234 }}
              />
            ) : allDriverPositions.length > 0 ? (
              <div className="h-full w-full">
                <AllDriversMap positions={allDriverPositions} orders={activeOrders} />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <MapPin className="mb-3 h-12 w-12 opacity-50" />
                <p className="text-sm">暂无在途订单</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-96 flex-col overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">在途订单</h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                {activeOrders.length} 单
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Clock className="mb-3 h-12 w-12 opacity-50" />
                <p className="text-sm">暂无在途订单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-4 transition-all',
                      selectedOrder?.id === order.id
                        ? 'border-[#165DFF] bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{order.orderNo}</span>
                      <div className="flex items-center gap-2">
                        {order.isOverdue && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            超时
                          </span>
                        )}
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            getStatusColor(order.status)
                          )}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {order.driver?.name || '未知司机'}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                          <span>{getAddressSummary(order.origin)}</span>
                          <ChevronRight className="h-3 w-3" />
                          <span>{getAddressSummary(order.destination)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Navigation className="h-3.5 w-3.5 text-blue-500" />
                        <span>预计 {order.eta ? formatDuration(order.eta) : '--'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-green-500" />
                        <span>运输中</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AllDriversMap({ positions, orders }: { positions: LocationPoint[]; orders: Order[] }) {
  const width = 800;
  const height = 500;
  const padding = 60;

  const bounds = useMemo(() => {
    if (positions.length === 0) {
      return { minLng: 116.3, maxLng: 116.5, minLat: 39.8, maxLat: 40.0 };
    }
    const lngs = positions.map((p) => p.lng);
    const lats = positions.map((p) => p.lat);
    return {
      minLng: Math.min(...lngs) - 0.02,
      maxLng: Math.max(...lngs) + 0.02,
      minLat: Math.min(...lats) - 0.02,
      maxLat: Math.max(...lats) + 0.02,
    };
  }, [positions]);

  const pointToSvg = useCallback(
    (point: LocationPoint): { x: number; y: number } => {
      const lngRange = bounds.maxLng - bounds.minLng || 1;
      const latRange = bounds.maxLat - bounds.minLat || 1;
      const x = padding + ((point.lng - bounds.minLng) / lngRange) * (width - padding * 2);
      const y = height - padding - ((point.lat - bounds.minLat) / latRange) * (height - padding * 2);
      return { x, y };
    },
    [bounds]
  );

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 8; i++) {
      const x = padding + (i / 8) * (width - padding * 2);
      lines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    }
    for (let i = 0; i <= 6; i++) {
      const y = padding + (i / 6) * (height - padding * 2);
      lines.push(
        <line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    }
    return lines;
  }, []);

  return (
    <div className="h-full min-h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <rect x="0" y="0" width={width} height={height} fill="#F9FAFB" />
        {gridLines}

        <rect
          x={padding}
          y={padding}
          width={width - padding * 2}
          height={height - padding * 2}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="2"
          rx="4"
        />

        {positions.map((pos, index) => {
          const svgPos = pointToSvg(pos);
          const order = orders[index];
          return (
            <g key={index} transform={`translate(${svgPos.x}, ${svgPos.y})`}>
              <circle r="16" fill="#165DFF" opacity="0.2">
                <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="10" fill="#165DFF" stroke="white" strokeWidth="2" />
              <Navigation className="h-4 w-4 text-white" transform="translate(-8, -8)" />
              {order && (
                <text
                  y="28"
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                >
                  {order.driver?.name || '司机'}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

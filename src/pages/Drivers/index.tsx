import { useEffect, useState, useMemo } from 'react';
import { Users, Star, Phone, User, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useDriverStore } from '@/store';
import type { Driver, DriverStatus, VehicleType } from '@/types';
import { cn } from '@/lib/utils';

const driverStatusConfig: Record<DriverStatus, { color: string; bg: string; label: string; dot: string }> = {
  online: { color: 'text-green-600', bg: 'bg-green-100', label: '在线', dot: 'bg-green-500' },
  offline: { color: 'text-gray-600', bg: 'bg-gray-100', label: '离线', dot: 'bg-gray-500' },
  busy: { color: 'text-orange-600', bg: 'bg-orange-100', label: '繁忙', dot: 'bg-orange-500' },
  resting: { color: 'text-blue-600', bg: 'bg-blue-100', label: '休息', dot: 'bg-blue-500' },
};

const vehicleTypeNames: Record<VehicleType, string> = {
  van: '面包车',
  small_truck: '小货车',
  medium_truck: '中货车',
  large_truck: '大货车',
};

function DriverStatusTag({ status }: { status: DriverStatus }) {
  const config = driverStatusConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', config.bg, config.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)}></span>
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: number; color: string }) {
  return (
    <Card className="flex-1">
      <div className="flex items-center gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function DriverCard({ driver, onViewDetail, onToggleStatus }: { driver: Driver; onViewDetail: (id: string) => void; onToggleStatus: (id: string) => void }) {
  const isDisabled = driver.status === 'offline';

  return (
    <Card className="flex flex-col">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <User className="h-7 w-7 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">{driver.name}</h3>
            <DriverStatusTag status={driver.status} />
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Phone className="h-3.5 w-3.5" />
            <span>{driver.phone}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-700">{driver.rating}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">完成 {driver.orderCount} 单</span>
          </div>
        </div>
      </div>

      {driver.vehicle && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <div className="text-sm font-medium text-gray-700">
            {vehicleTypeNames[driver.vehicle.type]}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            车牌号：{driver.vehicle.plateNumber}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            载重：{driver.vehicle.loadCapacity}吨 / {driver.vehicle.volumeCapacity}方
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetail(driver.id)}>
          查看详情
        </Button>
        <Button
          variant={isDisabled ? 'primary' : 'secondary'}
          size="sm"
          className="flex-1"
          onClick={() => onToggleStatus(driver.id)}
        >
          {isDisabled ? '启用' : '禁用'}
        </Button>
      </div>
    </Card>
  );
}

export default function Drivers() {
  const { drivers, loading, fetchDrivers, updateDriverStatus } = useDriverStore();
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'all'>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const stats = useMemo(() => {
    const total = drivers.length;
    const online = drivers.filter(d => d.status === 'online').length;
    const busy = drivers.filter(d => d.status === 'busy').length;
    const idle = drivers.filter(d => d.status === 'online' || d.status === 'resting').length;
    return { total, online, busy, idle };
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      if (statusFilter !== 'all' && driver.status !== statusFilter) return false;
      if (vehicleTypeFilter !== 'all' && driver.vehicle?.type !== vehicleTypeFilter) return false;
      if (searchText && !driver.name.includes(searchText) && !driver.phone.includes(searchText)) return false;
      return true;
    });
  }, [drivers, statusFilter, vehicleTypeFilter, searchText]);

  const handleToggleStatus = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    if (driver) {
      const newStatus: DriverStatus = driver.status === 'offline' ? 'online' : 'offline';
      updateDriverStatus(id, newStatus);
    }
  };

  const handleViewDetail = (id: string) => {
    console.log('查看司机详情:', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">司机管理</h1>
        <p className="mt-2 text-gray-500">管理平台注册司机</p>
      </div>

      <div className="flex gap-4">
        <StatCard icon={Users} label="总司机数" value={stats.total} color="bg-blue-500" />
        <StatCard icon={Users} label="在线司机" value={stats.online} color="bg-green-500" />
        <StatCard icon={Users} label="繁忙司机" value={stats.busy} color="bg-orange-500" />
        <StatCard icon={Users} label="空闲司机" value={stats.idle} color="bg-purple-500" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">状态：</span>
            <select
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DriverStatus | 'all')}
            >
              <option value="all">全部</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="busy">繁忙</option>
              <option value="resting">休息</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">车型：</span>
            <select
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value as VehicleType | 'all')}
            >
              <option value="all">全部</option>
              <option value="van">面包车</option>
              <option value="small_truck">小货车</option>
              <option value="medium_truck">中货车</option>
              <option value="large_truck">大货车</option>
            </select>
          </div>

          <div className="ml-auto flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索司机姓名或电话"
                className="h-9 w-64 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#165DFF] focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#165DFF] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDrivers.map(driver => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onViewDetail={handleViewDetail}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {!loading && filteredDrivers.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          暂无司机数据
        </div>
      )}
    </div>
  );
}

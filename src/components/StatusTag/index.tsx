import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

interface StatusTagProps {
  status: OrderStatus;
  text?: string;
}

const statusConfig: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-orange-600', bg: 'bg-orange-100', label: '待派单' },
  assigned: { color: 'text-blue-600', bg: 'bg-blue-100', label: '已派单' },
  accepted: { color: 'text-blue-600', bg: 'bg-blue-100', label: '已接单' },
  arrived_pickup: { color: 'text-cyan-600', bg: 'bg-cyan-100', label: '已到达' },
  loading: { color: 'text-cyan-600', bg: 'bg-cyan-100', label: '装货中' },
  transporting: { color: 'text-green-600', bg: 'bg-green-100', label: '运输中' },
  arrived_delivery: { color: 'text-purple-600', bg: 'bg-purple-100', label: '已送达' },
  unloading: { color: 'text-purple-600', bg: 'bg-purple-100', label: '卸货中' },
  completed: { color: 'text-gray-600', bg: 'bg-gray-100', label: '已完成' },
  cancelled: { color: 'text-red-600', bg: 'bg-red-100', label: '已取消' },
};

const dotColors: Record<OrderStatus, string> = {
  pending: 'bg-orange-500',
  assigned: 'bg-blue-500',
  accepted: 'bg-blue-500',
  arrived_pickup: 'bg-cyan-500',
  loading: 'bg-cyan-500',
  transporting: 'bg-green-500',
  arrived_delivery: 'bg-purple-500',
  unloading: 'bg-purple-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

export default function StatusTag({ status, text }: StatusTagProps) {
  const config = statusConfig[status];
  const label = text || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.color
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[status])}></span>
      {label}
    </span>
  );
}

import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyProps {
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export default function Empty({ description = '暂无数据', icon, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="mb-3 text-gray-300">
        {icon || <Package className="h-12 w-12" />}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

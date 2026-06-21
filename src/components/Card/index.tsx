import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg bg-white shadow-sm', className)}>
      {title && (
        <div className="border-b border-gray-100 px-5 py-4">
          {typeof title === 'string' ? (
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

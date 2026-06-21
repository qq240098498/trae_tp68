import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Send,
  Map,
  Calculator,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { path: '/orders', label: '订单管理', icon: Package },
  { path: '/drivers', label: '司机管理', icon: Users },
  { path: '/dispatch', label: '派单中心', icon: Send },
  { path: '/tracking', label: '实时追踪', icon: Map },
  { path: '/calculator', label: '运费计算器', icon: Calculator },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col bg-[#1D2129] text-white">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#165DFF]">
          <Truck className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold">同城货运</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[#165DFF] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <img
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20portrait%20avatar%20business%20style&image_size=square"
            alt="用户头像"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">张管理员</p>
            <p className="text-xs text-gray-400 truncate">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

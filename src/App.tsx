import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import NewOrder from '@/pages/NewOrder';
import OrderDetail from '@/pages/OrderDetail';
import Drivers from '@/pages/Drivers';
import Dispatch from '@/pages/Dispatch';
import Tracking from '@/pages/Tracking';
import Calculator from '@/pages/Calculator';
import Backhaul from '@/pages/Backhaul';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/backhaul" element={<Backhaul />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/calculator" element={<Calculator />} />
        </Route>
      </Routes>
    </Router>
  );
}

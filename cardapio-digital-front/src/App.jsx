import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientHome from './pages/ClientHome';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientHome />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
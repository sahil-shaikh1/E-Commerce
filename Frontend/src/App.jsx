import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/login'; // You'll need to create this
import Admin from './pages/Admin'; // You'll need to create this
import OrderConfirmation from './components/OrderConfirmation';
import MyOrders from './components/MyOrders'; // You'll need to create this
import ProductDetail from './pages/ProductDetail';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;

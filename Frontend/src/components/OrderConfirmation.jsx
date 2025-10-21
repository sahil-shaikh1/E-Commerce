// components/OrderConfirmation.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <Link to="/" className="text-cyan-600 hover:text-cyan-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <div className="border-t border-b py-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order Number:</span>
                <p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <span className="text-gray-500">Order Date:</span>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total Amount:</span>
                <p className="font-semibold">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Order Status:</span>
                <p className="font-semibold capitalize">{order.orderStatus}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            {order.items.map(item => (
              <div key={item._id} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover mr-4"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Link
              to="/"
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/my-orders"
              className="flex-1 py-3 px-6 bg-cyan-600 text-white text-center rounded-lg hover:bg-cyan-700 transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
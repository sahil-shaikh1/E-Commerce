// src/components/MyOrders.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = 'https://e-commerce-mw7r.onrender.com/api';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please login to view your orders');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/"
              className="block bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600 mt-2">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
            <Link 
              to="/"
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Link 
                to="/"
                className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-cyan-600">
                        ₹{formatPrice(order.totalAmount)}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-600 text-sm">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • 
                        Paid with {order.paymentMethod?.replace('_', ' ') || 'Cash on Delivery'}
                      </p>
                      <Link
                        to={`/order-confirmation/${order._id}`}
                        className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                      >
                        View Details
                        <span>→</span>
                      </Link>
                    </div>
                    
                    {/* Items Preview */}
                    <div className="flex gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <img 
                            src={item.image || item.productId?.image} 
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span>{item.name}</span>
                          {item.quantity > 1 && <span>×{item.quantity}</span>}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-gray-500 text-sm">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

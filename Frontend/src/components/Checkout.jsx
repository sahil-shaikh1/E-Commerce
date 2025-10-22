// components/Checkout.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';

const Checkout = ({ 
  cartItems, 
  onOrderSuccess, 
  onClose, 
  subtotal, 
  shipping, 
  tax, 
  total 
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const navigate = useNavigate();
  const API_BASE = 'https://e-commerce-mw7r.onrender.com/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const missing = required.filter(field => !shippingAddress[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const orderData = {
        shippingAddress,
        paymentMethod,
        items: cartItems.map(item => ({
          productId: item._id || item.productId?._id,
          name: item.product?.name || item.name,
          price: item.product?.price || item.price,
          quantity: item.quantity,
          image: item.product?.image || item.image
        })),
        totalAmount: total,
        subtotal,
        shipping,
        tax
      };

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      if (data.success) {
        // Clear cart
        await clearCart();
        
        // Success
        onOrderSuccess(data.order);
        
        // Navigate to confirmation
        navigate(`/order-confirmation/${data.order._id}`);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE}/users/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNum ? 'bg-cyan-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 ${step > stepNum ? 'bg-cyan-600' : 'bg-gray-300'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className={step >= 1 ? 'text-cyan-600 font-medium' : 'text-gray-500'}>Shipping</span>
            <span className={step >= 2 ? 'text-cyan-600 font-medium' : 'text-gray-500'}>Payment</span>
            <span className={step >= 3 ? 'text-cyan-600 font-medium' : 'text-gray-500'}>Confirmation</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Shipping Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={shippingAddress.email}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Full Address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <select
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Payment Method</h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium">Credit/Debit Card</span>
                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                </label>
              </div>

              {/* Card Details (shown only when card is selected) */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleCardChange}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <input
                    type="text"
                    name="nameOnCard"
                    placeholder="Name on Card"
                    value={cardDetails.nameOnCard}
                    onChange={handleCardChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm py-1">
                    <span>{item.product?.name || item.name} × {item.quantity}</span>
                    <span>₹{formatPrice((item.product?.price || item.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${formatPrice(shipping)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-cyan-600">₹{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Processing...' : step === 2 ? `Place Order • ₹${formatPrice(total)}` : 'Continue to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React, { useState, useMemo } from 'react';
import { formatPrice } from '../utils/helpers';
import Checkout from './Checkout';

const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart 
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Calculate totals
  const { subtotal, itemCount, shipping, tax, total, discount, finalTotal } = useMemo(() => {
    const subtotalValue = cartItems.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    const itemCountValue = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Calculate shipping (free over ₹5000)
    const shippingValue = subtotalValue > 5000 ? 0 : 99;
    
    // Calculate tax (18% GST on subtotal)
    const taxValue = subtotalValue * 0.18;
    
    // Calculate discount (simple promo code example)
    const discountValue = promoCode === 'SAVE10' ? subtotalValue * 0.1 : 0;
    
    const totalValue = subtotalValue + shippingValue + taxValue - discountValue;

    return {
      subtotal: subtotalValue,
      itemCount: itemCountValue,
      shipping: shippingValue,
      tax: taxValue,
      discount: discountValue,
      total: totalValue,
      finalTotal: Math.max(0, totalValue) // Ensure non-negative total
    };
  }, [cartItems, promoCode]);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowCheckout(true);
  };

  const handleOrderSuccess = (order) => {
    console.log('Order placed successfully:', order);
    setShowCheckout(false);
    onClose();
    setPromoCode(''); // Reset promo code after successful order
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
      setLoading(true);
      try {
        await onClearCart?.();
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      alert('Please enter a promo code');
      return;
    }
    
    // Simple promo code validation
    const validPromoCodes = ['SAVE10', 'WELCOME15', 'FREESHIP'];
    if (validPromoCodes.includes(promoCode.toUpperCase())) {
      alert(`Promo code "${promoCode}" applied successfully!`);
    } else {
      alert('Invalid promo code. Please try again.');
      setPromoCode('');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Cart Modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white w-full max-w-md h-full overflow-y-auto transform transition-transform duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Cart Header */}
          <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
              <p className="text-sm text-gray-600 mt-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  className="text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Clearing...' : 'Clear All'}
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Close cart"
              >
                <span className="text-xl text-gray-600 font-bold">&times;</span>
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-gray-300">🛒</div>
                <p className="text-xl text-gray-600 font-medium mb-2">Your cart is empty</p>
                <p className="text-gray-400 mb-6">Add some amazing products to get started!</p>
                <button 
                  onClick={onClose}
                  className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const quantity = item.quantity || 1;
                  const itemId = item._id || product._id;
                  const productId = product._id;
                  const itemTotal = (product.price || 0) * quantity;
                  const maxStock = product.stockQuantity || 99; // Fallback stock

                  return (
                    <div key={itemId} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-cyan-200 transition-colors group">
                      <img 
                        src={product.image || product.imageUrl || '/placeholder-image.jpg'} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                        {product.category && (
                          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                        )}
                        <p className="text-lg font-bold text-cyan-600">₹{formatPrice(product.price)}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onUpdateQuantity(productId, Math.max(1, quantity - 1))}
                              className="w-8 h-8 rounded-lg border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <span className="text-gray-600 hover:text-cyan-600">−</span>
                            </button>
                            <span className="w-8 text-center font-medium text-gray-800">{quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(productId, quantity + 1)}
                              className="w-8 h-8 rounded-lg border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={quantity >= maxStock}
                              aria-label="Increase quantity"
                            >
                              <span className="text-gray-600 hover:text-cyan-600">+</span>
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">₹{formatPrice(itemTotal)}</p>
                            <button 
                              onClick={() => onRemoveItem(productId)}
                              className="text-sm text-red-500 hover:text-red-700 mt-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {quantity >= maxStock && (
                          <p className="text-red-500 text-xs mt-2 font-medium">
                            ⚠️ Maximum quantity reached
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t bg-white sticky bottom-0 p-6 space-y-4 shadow-lg">
              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{formatPrice(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                    {shipping === 0 ? 'FREE' : `₹${formatPrice(shipping)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="font-medium">₹{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-cyan-600">₹{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="border-t pt-4">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!promoCode.trim()}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 5000 && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                  <div className="flex justify-between text-sm text-cyan-800 mb-1">
                    <span className="font-medium">Add ₹{formatPrice(5000 - subtotal)} for FREE shipping!</span>
                    <span className="font-bold">{Math.round((subtotal / 5000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-cyan-200 rounded-full h-2">
                    <div 
                      className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-cyan-600 text-white py-4 rounded-lg font-semibold hover:bg-cyan-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout • ₹{formatPrice(finalTotal)}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Security Badge */}
              <div className="text-center pt-4 border-t">
                <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                  <span className="text-green-500">🔒</span>
                  <span>Secure checkout • 100% protected • SSL encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          cartItems={cartItems}
          onOrderSuccess={handleOrderSuccess}
          onClose={() => setShowCheckout(false)}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          discount={discount}
          total={finalTotal}
        />
      )}
    </>
  );
};

export default CartModal;
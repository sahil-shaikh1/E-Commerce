import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WishlistModal = ({ 
  isOpen, 
  onClose, 
  wishlistItems = [], 
  onRemoveFromWishlist, 
  onAddToCart,
  isLoggedIn 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const handleAddToCart = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      setActionLoading(`addToCart${product._id}`);
      setError(null);
      await onAddToCart(product);
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
      console.error('Add to cart error:', err);
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const handleRemoveFromWishlist = async (productId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      setActionLoading(`remove${productId}`);
      setError(null);
      await onRemoveFromWishlist(productId);
    } catch (err) {
      setError(err.message || 'Failed to remove from wishlist');
      console.error('Remove from wishlist error:', err);
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  const handleModalClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onClose();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto pt-20"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-pink-600 to-rose-600 text-white">
          <h2 className="text-xl font-semibold">
            Your Wishlist ({wishlistItems.length || 0})
          </h2>
          <button 
            onClick={handleModalClose}
            className="text-white hover:text-pink-200 text-2xl transition-all duration-300 ease-in-out focus:outline-none"
            type="button"
          >
            &times;
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-lg text-gray-600 mb-4">Please log in to view your wishlist</p>
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out focus:outline-none"
              type="button"
            >
              Log In
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm border-l-4 border-red-500">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="p-4 max-h-96 overflow-y-auto">
              {loading && wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  <p className="mt-2 text-gray-600">Loading wishlist...</p>
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-6xl mb-4">❤️</div>
                  <p className="text-lg font-medium text-gray-600">Your wishlist is empty</p>
                  <p className="text-sm mt-2 text-gray-400">Add products you love to your wishlist!</p>
                  <button
                    onClick={handleModalClose}
                    className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-300 ease-in-out focus:outline-none"
                    type="button"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map(product => {
                    const isAddingToCart = actionLoading === `addToCart${product._id}`;
                    const isRemoving = actionLoading === `remove${product._id}`;
                    
                    return (
                      <div 
                        key={product._id} 
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 ease-in-out bg-white group"
                      >
                        <img 
                          src={product.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 group-hover:border-pink-300 transition-all duration-300 ease-in-out"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate group-hover:text-pink-600 transition-all duration-300 ease-in-out">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{product.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-green-600 font-bold text-lg">
                              ₹{((product.price || 0))?.toLocaleString('en-IN')}
                            </p>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <p className="text-gray-500 text-sm line-through">
                                ₹{product.originalPrice?.toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                          {product.inStock === false && (
                            <p className="text-red-500 text-xs font-medium mt-1">Out of Stock</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={isAddingToCart || isRemoving || product.inStock === false}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-semibold transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:outline-none"
                            type="button"
                          >
                            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                          </button>
                          <button
                            onClick={(e) => handleRemoveFromWishlist(product._id, e)}
                            disabled={isAddingToCart || isRemoving}
                            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-700 text-sm font-semibold transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                            type="button"
                          >
                            {isRemoving ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {wishlistItems.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in wishlist
              </span>
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none"
                type="button"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistModal;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StarIcon from '../components/icons/StarIcon';
import HeartIcon from '../components/icons/HeartIcon';
import TruckIcon from '../components/icons/TruckIcon';
import CartModal from '../components/CartModal';
import WishlistModal from '../components/WishlistModal';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  // Add state for header functionality
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = 'https://e-commerce-mw7r.onrender.com/api';

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  useEffect(() => {
    fetchProduct();
    if (isLoggedIn()) {
      fetchCart();
      fetchWishlist();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        const productData = data.product;
        // Ensure image URL is properly formatted
        if (productData.image && !productData.image.startsWith('http')) {
          productData.image = `https://e-commerce-mw7r.onrender.com/${productData.image.replace(/^\/+/, '')}`;
        }
        setProduct(productData);
      } else {
        setNotification('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotification('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(`${API_BASE}/users/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
       
      if (data.success) {
        setCart(data.cart || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(`${API_BASE}/users/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.wishlist || []);
        // Check if current product is in wishlist
        const inWishlist = (data.wishlist || []).some(item => 
          item._id === productId || item.product?._id === productId
        );
        setIsInWishlist(inWishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Cart functions
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setNotification('🔒 Please login to add items to cart');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/users/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId: product._id, 
          quantity: quantity 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCart(data.cart || []);
        setNotification(`🛒 "${product.name}" added to cart!`);
        setTimeout(() => setNotification(''), 3000);
      } else {
        setNotification(data.message || '❌ Failed to add item to cart');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification('❌ Error adding item to cart');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    try {
      setUpdatingWishlist(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setNotification('🔒 Please login to add items to wishlist');
        navigate('/login');
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`${API_BASE}/users/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setIsInWishlist(false);
          setWishlist(data.wishlist || []);
          setNotification('💔 Removed from wishlist');
          setTimeout(() => setNotification(''), 3000);
        } else {
          setNotification('❌ Failed to remove from wishlist');
          setTimeout(() => setNotification(''), 3000);
        }
      } else {
        // Add to wishlist
        const response = await fetch(`${API_BASE}/users/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id }),
        });

        const data = await response.json();
        if (data.success) {
          setIsInWishlist(true);
          setWishlist(data.wishlist || []);
          setNotification('❤️ Added to wishlist');
          setTimeout(() => setNotification(''), 3000);
        } else {
          setNotification('❌ Failed to add to wishlist');
          setTimeout(() => setNotification(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setNotification('❌ Failed to update wishlist');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setUpdatingWishlist(false);
    }
  };

  // Cart modal functions
  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/users/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.cart || []);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/users/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.cart || []);
        setNotification('🗑️ Item removed from cart');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/users/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCart([]);
        setNotification('🗑️ Cart cleared');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Wishlist modal functions
  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/users/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setWishlist(data.wishlist || []);
        // Update current product's wishlist status if needed
        if (productId === product?._id) {
          setIsInWishlist(false);
        }
        setNotification('💔 Removed from wishlist');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Handle search from header
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    navigate(`/?search=${encodeURIComponent(searchValue)}`);
  };

  // Calculate counts for header
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const wishlistCount = wishlist.length;

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '0';
    return price.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = !product.inStock || (product.stockQuantity || 0) === 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn()}
        onLoginClick={() => navigate('/login')}
      />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 left-4 right-4 mx-auto text-white py-3 px-4 rounded-xl shadow-2xl z-50 animate-fade-in-out border-l-4 ${
          notification.includes('❌') ? 'bg-red-500 border-red-400' :
          notification.includes('🔒') ? 'bg-blue-500 border-blue-400' :
          notification.includes('🗑️') ? 'bg-gray-600 border-gray-500' :
          notification.includes('💔') ? 'bg-pink-500 border-pink-400' :
          'bg-green-500 border-green-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">
              {notification.includes('❌') ? '❌' :
               notification.includes('🔒') ? '🔒' :
               notification.includes('🗑️') ? '🗑️' :
               notification.includes('❤️') ? '❤️' :
               notification.includes('💔') ? '💔' :
               notification.includes('🛒') ? '🛒' : '🎉'}
            </span>
            <span className="font-semibold text-sm flex-1 break-words">
              {notification.replace(/[❌🔒🗑️❤️💔🛒🎉]/g, '').trim()}
            </span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                {!imageLoaded && !imageError && (
                  <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-400">Loading image...</span>
                  </div>
                )}
                <img 
                  src={imageError 
                    ? "https://via.placeholder.com/600x600?text=Image+Not+Found" 
                    : product.image
                  }
                  alt={product.name}
                  className={`w-full h-96 object-cover ${imageLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4 text-lg">{product.category}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled={i < Math.floor(product.rating || 0)} />
                    ))}
                    <span className="ml-2 text-gray-600 font-medium">{product.rating || 0}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">₹{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{formatPrice(product.originalPrice)}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                        Save ₹{formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>

                {product.features && product.features.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-lg">Features:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="text-base">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 text-lg">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-4 py-2 text-gray-600 hover:text-cyan-600 text-lg"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-l border-r border-gray-300 text-lg font-medium">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="px-4 py-2 text-gray-600 hover:text-cyan-600 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart}
                    className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                      isOutOfStock 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : addingToCart
                        ? 'bg-amber-400 text-white cursor-wait'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      isOutOfStock ? 'Out of Stock' : 'Add to Cart'
                    )}
                  </button>
                  
                  <button 
                    onClick={handleAddToWishlist}
                    disabled={updatingWishlist}
                    className={`p-4 border rounded-lg transition-colors flex items-center justify-center ${
                      isInWishlist 
                        ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100' 
                        : updatingWishlist
                        ? 'border-gray-300 text-gray-400 cursor-wait'
                        : 'border-gray-300 hover:border-cyan-600 hover:text-cyan-600 hover:bg-cyan-50'
                    }`}
                  >
                    {updatingWishlist ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <HeartIcon filled={isInWishlist} />
                    )}
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base">Free shipping on orders over ₹999</span>
                </div>
                {product.fastDelivery && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <TruckIcon />
                    <span className="text-base">Fast delivery available</span>
                  </div>
                )}
                {product.stockQuantity && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-base">{product.stockQuantity} units available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onRemoveItem={handleRemoveItem}
      />
      
      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        isLoggedIn={isLoggedIn()}
      />
    </div>
  );
};

export default ProductDetail;

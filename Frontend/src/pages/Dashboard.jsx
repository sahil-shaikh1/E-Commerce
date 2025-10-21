import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageSlider from '../components/ImageSlider';
import Filters from '../components/Filters';
import ProductCard from '../components/ProductCard';
import CartModal from '../components/CartModal';
import WishlistModal from '../components/WishlistModal';
import Notification from '../components/Notification';
import FilterAdjustIcon from '../components/icons/FilterAdjustIcon';
import { mockSlides } from '../data/mockData';

const Dashboard = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ max: 150000 });
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState({ inStock: false });
  const [delivery, setDelivery] = useState({ fastDelivery: false });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  // Debug effects
  useEffect(() => {
    console.log('🔍 WISHLIST DATA STRUCTURE:', {
      wishlist,
      firstItem: wishlist[0],
      typeOfFirstItem: typeof wishlist[0],
      keysOfFirstItem: wishlist[0] ? Object.keys(wishlist[0]) : 'No items'
    });
  }, [wishlist]);

  useEffect(() => {
    console.log('📊 Dashboard Wishlist State:', {
      wishlist,
      wishlistLength: wishlist.length,
      wishlistItems: wishlist[0]
    });
  }, [wishlist]);

  // API base URL
  const API_BASE = 'http://localhost:5000/api';

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
    if (isLoggedIn()) {
      fetchCart();
      fetchWishlist();
    }
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();

      if (data.success) {
        const updatedProducts = (data.products || []).map(p => ({
          ...p,
          image: p.image?.startsWith('http')
            ? p.image
            : `http://localhost:5000/${p.image?.replace(/^\/+/, '')}`
        }));
        setProducts(updatedProducts);
      } else {
        setNotification('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setNotification('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user cart
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
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

  // Fetch user wishlist
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/users/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      console.log('Fetched wishlist data:', data);
      
      if (data.success) {
        setWishlist(data.wishlist || []);
      } else {
        console.error('Failed to fetch wishlist:', data.message);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 150000;
    const maxProductPrice = Math.max(...products.map(p => p.price));
    return Math.ceil(maxProductPrice / 1000) * 1000;
  }, [products]);

  // Initialize price range
  useEffect(() => {
    setPriceRange({ max: maxPrice });
  }, [maxPrice]);

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 4000); // Increased timeout for better readability
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show stock alert notification
  const showStockAlert = (product, currentQuantity, stockQuantity) => {
    const remainingStock = stockQuantity - currentQuantity;
    
    if (remainingStock <= 0) {
      setNotification(`❌ "${product.name}" is out of stock!`);
    } else {
      setNotification(`⚠️ Only ${remainingStock} item${remainingStock > 1 ? 's' : ''} of "${product.name}" available in stock!`);
    }
  };

  // Cart functions - UPDATED WITH STOCK ALERTS
  const handleAddToCart = async (productToAdd) => {
    if (!isLoggedIn()) {
      setNotification('🔒 Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      // Check if product is already in cart
      const existingCartItem = cart.find(item => item._id === productToAdd._id);
      const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const requestedQuantity = currentQuantity + 1;

      // Check stock availability using stockQuantity
      const stockQuantity = productToAdd.stockQuantity || 0;
      
      if (requestedQuantity > stockQuantity) {
        showStockAlert(productToAdd, currentQuantity, stockQuantity);
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/users/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId: productToAdd._id, 
          quantity: 1 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCart(data.cart);
        setNotification(`🛒 "${productToAdd.name}" added to cart!`);
      } else {
        // Check if backend also returned stock error
        if (data.message && data.message.includes('stock')) {
          showStockAlert(productToAdd, currentQuantity, stockQuantity);
        } else {
          throw new Error(data.message || 'Failed to add item to cart');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification(`❌ ${error.message || 'Failed to add item to cart'}`);
      throw error;
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      // Find the product to check stockQuantity
      const product = products.find(p => p._id === productId);
      const stockQuantity = product?.stockQuantity || 0;
      
      if (quantity > stockQuantity) {
        showStockAlert(product, quantity - 1, stockQuantity);
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/users/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.cart);
        if (quantity === stockQuantity) {
          setNotification(`⚠️ Maximum quantity reached for "${product.name}"`);
        }
      } else {
        if (data.message && data.message.includes('stock')) {
          showStockAlert(product, quantity - 1, stockQuantity);
        } else {
          setNotification('❌ Failed to update quantity');
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setNotification('❌ Error updating quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/users/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.cart);
        setNotification('🗑️ Item removed from cart');
      } else {
        setNotification('❌ Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setNotification('❌ Error removing item');
    }
  };

  // Wishlist functions - UPDATED TOGGLE VERSION
  const handleAddToWishlist = async (product) => {
    if (!isLoggedIn()) {
      setNotification('🔒 Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    // Check if product is already in wishlist
    const isCurrentlyInWishlist = wishlist.some(item => item._id === product._id);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        const response = await fetch(`${API_BASE}/users/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        
        if (data.success) {
          setWishlist(data.wishlist || []);
          setNotification('❤️ Removed from wishlist');
        } else {
          throw new Error(data.message || 'Failed to remove from wishlist');
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
          setWishlist(data.wishlist || []);
          setNotification('❤️ Added to wishlist');
        } else {
          throw new Error(data.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setNotification(`❌ ${error.message || 'Failed to update wishlist'}`);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/users/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.wishlist || []);
        setNotification('🗑️ Item removed from wishlist');
      } else {
        throw new Error(data.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setNotification(`❌ ${error.message || 'Failed to remove from wishlist'}`);
      throw error;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  // Filter functions
  const handleClearFilters = () => {
    setSortBy('relevance');
    setCategory('All');
    setPriceRange({ max: maxPrice });
    setMinRating(0);
    setAvailability({ inStock: false });
    setDelivery({ fastDelivery: false });
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product =>
        category === 'All' || product.category === category
      )
      .filter(product => product.price <= priceRange.max)
      .filter(product => product.rating >= minRating)
      .filter(product => !availability.inStock || product.inStock)
      .filter(product => !delivery.fastDelivery || product.fastDelivery)
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating-desc':
            return b.rating - a.rating;
          case 'discount-desc':
            const discountA = (a.originalPrice || a.price) - a.price;
            const discountB = (b.originalPrice || b.price) - b.price;
            return discountB - discountA;
          default:
            return 0;
        }
      });
  }, [products, searchTerm, category, sortBy, priceRange, minRating, availability, delivery]);

  // Calculate counts
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CSS Styles */}
      <style>{`
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(-20px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 4s ease-in-out forwards;
        }
        @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out 0.2s forwards;
            opacity: 0;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #0891b2;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #0891b2;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
      
      {/* Header */}
      <Header
        onSearch={setSearchTerm}
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn()}
        onLoginClick={() => navigate('/login')}
      />
      
      {/* Enhanced Notification with better styling */}
      {notification && (
        <div className={`fixed top-24 right-5 text-white py-4 px-6 rounded-xl shadow-2xl z-50 animate-fade-in-out border-l-4 max-w-md ${
          notification.includes('❌') || notification.includes('out of stock')
            ? 'bg-red-500 border-red-400' 
            : notification.includes('⚠️') 
            ? 'bg-orange-500 border-orange-400'
            : notification.includes('🔒')
            ? 'bg-blue-500 border-blue-400'
            : notification.includes('🗑️')
            ? 'bg-gray-600 border-gray-500'
            : 'bg-green-500 border-green-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {notification.includes('❌') ? '❌' :
               notification.includes('⚠️') ? '⚠️' :
               notification.includes('🔒') ? '🔒' :
               notification.includes('🗑️') ? '🗑️' :
               notification.includes('❤️') ? '❤️' :
               notification.includes('🛒') ? '🛒' : '🎉'}
            </span>
            <span className="font-semibold text-sm">{notification.replace(/[❌⚠️🔒🗑️❤️🛒🎉]/g, '').trim()}</span>
          </div>
        </div>
      )}

      {/* Rest of your JSX remains the same */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Slider */}
        <ImageSlider slides={mockSlides} />

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Products'}
            </h1>
            <p className="text-gray-600 mt-2">
              Showing {filteredAndSortedProducts.length} of {products.length} products
            </p>
          </div>
          <div className="hidden lg:block text-sm text-gray-500">
            Sort by: 
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-2 border-0 bg-transparent font-semibold text-gray-700 focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Customer Rating</option>
              <option value="discount-desc">Best Discount</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Filters and Products Section */}
        {!loading && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Show Filters Button for Desktop */}
            {!showFilters && (
              <div className="hidden lg:block">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md font-semibold text-gray-700 hover:bg-gray-50 transition-all border"
                >
                  <FilterAdjustIcon />
                  Show Filters
                  <span className="bg-cyan-100 text-cyan-600 px-2 py-1 rounded-full text-sm">
                    {filteredAndSortedProducts.length}
                  </span>
                </button>
              </div>
            )}

            {/* Filters Sidebar */}
            {(showFilters || isFilterOpen) && (
              <Filters 
                setSortBy={setSortBy} 
                setCategory={setCategory} 
                selectedCategory={category}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                minRating={minRating}
                onRatingChange={setMinRating}
                onClearFilters={handleClearFilters}
                maxPrice={maxPrice}
                isOpen={isFilterOpen}
                onClose={() => {
                  setIsFilterOpen(false);
                  setShowFilters(false);
                }}
                availability={availability}
                onAvailabilityChange={setAvailability}
                delivery={delivery}
                onDeliveryChange={setDelivery}
              />
            )}
            
            {/* Products Grid */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="mb-6 lg:hidden">
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md font-semibold text-gray-700 hover:bg-gray-50 transition-all border"
                >
                  <FilterAdjustIcon />
                  Show Filters & Sort
                  <span className="bg-cyan-100 text-cyan-600 px-2 py-1 rounded-full text-sm">
                    {filteredAndSortedProducts.length}
                  </span>
                </button>
              </div>

              {/* Products Grid */}
              {filteredAndSortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      isInWishlist={isInWishlist(product._id)}
                      cartItems={cart}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-gray-700 mb-4">No products found</h2>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {products.length === 0 
                      ? 'No products available. Please check back later.'
                      : 'We couldn\'t find any products matching your criteria. Try adjusting your search or filters.'
                    }
                  </p>
                  {products.length > 0 && (
                    <button 
                      onClick={handleClearFilters}
                      className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors font-semibold"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        products={products}
      />
      
      {/* Wishlist Modal */}
     <WishlistModal
  isOpen={isWishlistOpen}
  onClose={() => setIsWishlistOpen(false)}
 
  wishlistItems={wishlist} // This should be array of full product objects
  onRemoveFromWishlist={handleRemoveFromWishlist}
  onAddToCart={handleAddToCart}
  isLoggedIn={isLoggedIn()}
/>
    </div>
  );
};

export default Dashboard;
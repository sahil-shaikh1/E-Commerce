import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '../components/icons/SearchIcon';
import CartIcon from '../components/icons/CartIcon';
import HeartIcon from '../components/icons/HeartIcon';

const Header = ({ 
  onSearch, 
  cartItemCount, 
  onCartClick, 
  onWishlistClick, 
  wishlistCount,
  isLoggedIn,
  onLoginClick 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    
    // Reset user state
    setUser(null);
    
    // Reload the page to reset the app state
    window.location.reload();
  };

  const handleAccountClick = () => {
    if (isLoggedIn) {
      // Show account dropdown or navigate to profile
      navigate('/profile'); // You can create a profile page later
    } else {
      onLoginClick();
    }
  };

  const handleMyOrdersClick = () => {
    if (isLoggedIn) {
      navigate('/my-orders');
    } else {
      onLoginClick();
    }
  };

  return (
    <header className={`bg-cyan-600 text-white shadow-md sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-2' : 'py-0'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold italic">CherishIndia</h1>
            <span className="ml-2 text-xs italic text-yellow-300">Plus</span>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                onChange={(e) => onSearch(e.target.value)}
                className="w-full bg-white text-gray-800 rounded-md py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-400 border-0 shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-6">
            {/* My Orders Button - Always visible when logged in */}
            {isLoggedIn && (
              <button 
                onClick={handleMyOrdersClick}
                className="hidden md:flex flex-col items-center px-3 py-2 hover:bg-cyan-700 rounded-md transition"
              >
                <span className="text-sm">Returns</span>
                <span className="text-sm font-bold">& Orders</span>
              </button>
            )}

            {/* Account/Login Button */}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="hidden sm:flex flex-col items-center px-3 py-2 hover:bg-cyan-700 rounded-md transition">
                  <span className="text-sm">Hello, {user?.fullName?.split(' ')[0] || 'User'}</span>
                  <span className="text-sm font-bold">Account & Lists</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="py-2">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <span>👤</span>
                      <span>Your Profile</span>
                    </button>
                    
                    <button 
                      onClick={handleMyOrdersClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <span>📦</span>
                      <span>Your Orders</span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/wishlist')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <span>❤️</span>
                      <span>Your Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    {/* Admin Panel Link */}
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => navigate('/admin')}
                        className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-3 border-t border-gray-200 mt-2"
                      >
                        <span>⚙️</span>
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Logout */}
                  <div className="border-t border-gray-200 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="hidden sm:flex flex-col items-center px-3 py-2 hover:bg-cyan-700 rounded-md transition"
              >
                <span className="text-sm">Hello, Sign in</span>
                <span className="text-sm font-bold">Account & Lists</span>
              </button>
            )}

            {/* Mobile Menu */}
            <div className="sm:hidden flex items-center space-x-4">
              {/* Mobile My Orders */}
              {isLoggedIn && (
                <button 
                  onClick={handleMyOrdersClick}
                  className="p-2 rounded-full hover:bg-cyan-700 transition"
                  title="My Orders"
                >
                  <span className="text-lg">📦</span>
                </button>
              )}

              {/* Mobile Login/Logout */}
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="p-2 rounded-full hover:bg-cyan-700 transition">
                    <span className="text-lg">👤</span>
                  </button>
                  
                  {/* Mobile Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-800 truncate">{user?.fullName}</p>
                    </div>
                    
                    <button 
                      onClick={handleMyOrdersClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="px-3 py-2 hover:bg-cyan-700 rounded-md transition text-sm"
                >
                  Login
                </button>
              )}
            </div>
            
            {/* Wishlist */}
            <button 
              onClick={onWishlistClick}
              className="relative p-2 rounded-full hover:bg-cyan-700 transition"
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>
            
            {/* Cart */}
            <button 
              onClick={onCartClick} 
              className="relative p-2 rounded-full hover:bg-cyan-700 transition flex items-center"
            >
              <CartIcon itemCount={cartItemCount} />
              <span className="hidden sm:block ml-1 text-sm font-semibold">
                Cart {cartItemCount > 0 && `(${cartItemCount})`}
              </span>
              
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold sm:hidden">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Navigation - For larger screens */}
        <div className="hidden lg:flex items-center justify-between py-2 border-t border-cyan-500 mt-2">
          <div className="flex items-center space-x-6 text-sm">
            <button className="hover:text-cyan-200 transition">All</button>
            <button className="hover:text-cyan-200 transition">Today's Deals</button>
            <button className="hover:text-cyan-200 transition">Customer Service</button>
            <button className="hover:text-cyan-200 transition">Registry</button>
            <button className="hover:text-cyan-200 transition">Gift Cards</button>
            <button className="hover:text-cyan-200 transition">Sell</button>
          </div>
          
          {isLoggedIn && (
            <div className="flex items-center space-x-4 text-sm">
              <button 
                onClick={handleMyOrdersClick}
                className="hover:text-cyan-200 transition flex items-center gap-1"
              >
                <span>📦</span>
                <span>Your Orders</span>
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="hover:text-cyan-200 transition flex items-center gap-1 bg-purple-500 px-3 py-1 rounded-full text-xs"
                >
                  <span>⚙️</span>
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
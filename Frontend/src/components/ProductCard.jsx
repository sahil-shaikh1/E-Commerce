import React, { useState } from 'react';
import StarIcon from '../components/icons/StarIcon';
import HeartIcon from '../components/icons/HeartIcon';
import TruckIcon from '../components/icons/TruckIcon';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, isInWishlist, cartItems = [] }) => {
  // Add safety check for product
  if (!product) {
    return null;
  }

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Calculate current quantity in cart for this product
  const getCurrentCartQuantity = () => {
    const cartItem = cartItems.find(item => item._id === product._id);
    return cartItem ? cartItem.quantity : 0;
  };

  const currentCartQuantity = getCurrentCartQuantity();
  const stockQuantity = product.stockQuantity || 0;
  const isOutOfStock = !product.inStock || stockQuantity === 0;
  const canAddMore = currentCartQuantity < stockQuantity;
  const remainingStock = stockQuantity - currentCartQuantity;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    // Check all stock conditions
    if (isOutOfStock || !canAddMore || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await onAddToCart(product);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleWishlist = (e) => {
    e.stopPropagation();
    onAddToWishlist(product);
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '0';
    return price.toLocaleString('en-IN');
  };

  const formatNumber = (number) => {
    return (number || 0).toLocaleString('en-IN');
  };

  // Get button text based on stock status
  const getButtonText = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (!canAddMore) return 'Max Quantity Reached';
    if (isAddingToCart) return 'Adding...';
    return 'Add to Cart';
  };

  // Get button disabled state
  const isButtonDisabled = isOutOfStock || !canAddMore || isAddingToCart;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 hover:border-cyan-200 group">
      <div className="relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="text-gray-400">Loading...</span>
          </div>
        )}
        <img
          src={
            imageError
              ? "https://via.placeholder.com/300x400?text=Image+Not+Found"
              : product.image?.startsWith("http")
              ? product.image // full URL (for online images)
              : `http://localhost:5000/${product.image}` // local uploads folder
          }
          alt={product.name || "Product image"}
          className={`w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? "block" : "hidden"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3">
          <HeartIcon 
            filled={isInWishlist} 
            onClick={handleWishlist}
          />
        </div>

        {/* Stock Status Badge */}
        <div className="absolute bottom-3 left-3">
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            isOutOfStock 
              ? 'bg-red-100 text-red-800' 
              : remainingStock <= 3 
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
          }`}>
            {isOutOfStock 
              ? 'Out of Stock' 
              : remainingStock <= 3 
                ? `Only ${remainingStock} left!` 
                : 'In Stock'
            }
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-lg font-bold text-gray-800">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-cyan-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.floor(product.rating)} />
            ))}
          </div>
          <span className="text-gray-600 text-sm ml-2 font-medium">
            {product.rating} ({formatNumber(product.reviews)} reviews)
          </span>
        </div>

        {/* Price Section */}
        <div className="mb-4 mt-auto">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold text-gray-900">
              ₹{formatPrice(product.price)}
            </p>
            {product.originalPrice > product.price && (
              <p className="text-lg text-gray-500 line-through">
                ₹{formatPrice(product.originalPrice)}
            </p>
            )}
          </div>
          {product.originalPrice > product.price && (
            <p className="text-sm text-green-600 font-semibold">
              You save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Cart Quantity Info */}
        {currentCartQuantity > 0 && (
          <div className="mb-2">
            <p className={`text-sm font-medium ${
              canAddMore ? 'text-blue-600' : 'text-red-600'
            }`}>
              In cart: {currentCartQuantity} {!canAddMore && '(Max reached)'}
            </p>
            {canAddMore && remainingStock > 0 && (
              <p className="text-xs text-gray-500">
                Can add {remainingStock} more
              </p>
            )}
          </div>
        )}

        {/* Delivery Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          {product.fastDelivery ? (
            <>
              <TruckIcon />
              <span className="text-green-600 font-medium">Free Delivery</span>
            </>
          ) : (
            <span>Standard Delivery</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isButtonDisabled}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-amber-400 text-white cursor-wait'
              : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
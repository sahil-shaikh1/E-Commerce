import React from 'react';
import StarIcon from '../components/icons/StarIcon';
import FilterAdjustIcon from '../components/icons/FilterAdjustIcon';

const Filters = ({ 
  setSortBy, 
  setCategory, 
  selectedCategory, 
  priceRange, 
  onPriceChange, 
  minRating, 
  onRatingChange, 
  onClearFilters, 
  maxPrice, 
  isOpen, 
  onClose,
  availability,
  onAvailabilityChange,
  delivery,
  onDeliveryChange
}) => {
  const categories = ['All', 'Electronics', 'Fashion', 'Books', 'Home Appliances', 'Sports'];
  const ratings = [4, 3, 2, 1];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={`
        w-80 bg-white p-6 transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen
          ? 'fixed top-0 left-0 h-full z-50 translate-x-0 shadow-2xl'
          : 'fixed top-0 left-0 h-full z-50 -translate-x-full'
        }
        lg:sticky lg:top-24 lg:h-auto lg:shadow-lg lg:rounded-xl lg:translate-x-0
      `}>
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Filters</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={onClearFilters} 
              className="text-sm text-cyan-600 hover:underline font-semibold"
            >
              Clear All
            </button>
            <button 
              onClick={onClose} 
              className="lg:hidden text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Availability Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Availability</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={availability.inStock}
                onChange={(e) => onAvailabilityChange({ ...availability, inStock: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="ml-2 text-sm text-gray-600">In Stock</span>
            </label>
          </div>
        </div>

        {/* Delivery Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Delivery</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={delivery.fastDelivery}
                onChange={(e) => onDeliveryChange({ ...delivery, fastDelivery: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="ml-2 text-sm text-gray-600">Fast Delivery</span>
            </label>
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Price Range</h3>
          <div className="space-y-4">
            <div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange.max}
                onChange={(e) => onPriceChange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>₹0</span>
                <span className="font-semibold">Up to ₹{priceRange.max.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rating Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Customer Rating</h3>
          <div className="flex flex-col gap-2">
            {ratings.map(rating => (
              <button
                key={rating}
                onClick={() => onRatingChange(rating === minRating ? 0 : rating)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  minRating === rating 
                    ? 'bg-cyan-50 border border-cyan-200 text-cyan-700' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < rating} extraClasses="h-4 w-4" />
                  ))}
                </span>
                <span className="text-sm font-medium">{rating}★ & above</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Category</h3>
          <div className="flex flex-col gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                  selectedCategory === cat 
                    ? 'bg-cyan-600 text-white font-semibold shadow-md' 
                    : 'hover:bg-gray-50 text-gray-700 border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Sort By Filter */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-700">Sort by</h3>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Customer Rating</option>
            <option value="discount-desc">Best Discount</option>
          </select>
        </div>
      </aside>
    </>
  );
};

export default Filters;
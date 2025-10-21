const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  
  // Updated Image Fields for both URL and File Upload
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  imageType: {
    type: String,
    enum: ['url', 'upload'],
    default: 'url'
  },
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['url', 'upload'],
      default: 'url'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Enhanced Stock Management
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Stock quantity must be an integer'
    }
  },
  lowStockAlert: {
    type: Number,
    default: 5,
    min: 0
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  allowBackorders: {
    type: Boolean,
    default: false
  },
  maxOrderQuantity: {
    type: Number,
    default: 10,
    min: 1
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  // Product Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  
  // Enhanced Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: function(val) {
      return Math.round(val * 10) / 10; // Round to 1 decimal place
    }
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  ratingsDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  
  // Shipping & Delivery
  fastDelivery: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  
  // SEO & Organization
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  
  // Product Details
  brand: String,
  features: [String],
  specifications: {
    type: Map,
    of: String
  },
  
  // Sales & Analytics
  totalSold: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Timestamps for analytics
  lastSold: Date,
  lastRestocked: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for stock status with more detailed information
productSchema.virtual('stockStatus').get(function() {
  if (!this.trackInventory) {
    return this.inStock ? 'in_stock' : 'out_of_stock';
  }
  
  if (this.stockQuantity > this.lowStockAlert) {
    return 'in_stock';
  } else if (this.stockQuantity > 0) {
    return 'low_stock';
  } else if (this.allowBackorders) {
    return 'backorder';
  } else {
    return 'out_of_stock';
  }
});

// Virtual for checking if product can be purchased
productSchema.virtual('isPurchasable').get(function() {
  if (this.status !== 'active') return false;
  
  if (!this.trackInventory) return this.inStock;
  
  return this.stockQuantity > 0 || this.allowBackorders;
});

// Virtual for stock message (user-friendly)
productSchema.virtual('stockMessage').get(function() {
  const status = this.stockStatus;
  
  switch (status) {
    case 'in_stock':
      return this.stockQuantity > 10 ? 'In Stock' : `Only ${this.stockQuantity} left`;
    case 'low_stock':
      return `Only ${this.stockQuantity} left in stock - Order soon!`;
    case 'backorder':
      return 'Available on backorder';
    case 'out_of_stock':
      return 'Out of Stock';
    default:
      return 'Check Availability';
  }
});

// Virtual for image URL with proper path
productSchema.virtual('imageUrl').get(function() {
  if (this.imageType === 'upload' && this.image) {
    // For uploaded files, return full URL path
    return `${process.env.BASE_URL || 'http://localhost:5000'}${this.image}`;
  }
  return this.image; // For URL type, return as is
});

// Method to check if quantity is available
productSchema.methods.isQuantityAvailable = function(quantity) {
  if (!this.isPurchasable) return false;
  
  if (!this.trackInventory) return true;
  
  if (quantity > this.maxOrderQuantity) {
    throw new Error(`Cannot order more than ${this.maxOrderQuantity} items`);
  }
  
  if (this.allowBackorders) return true;
  
  return this.stockQuantity >= quantity;
};

// Method to reserve stock (for cart/orders)
productSchema.methods.reserveStock = async function(quantity) {
  if (!this.trackInventory) return this;
  
  if (!this.isQuantityAvailable(quantity)) {
    throw new Error(`Insufficient stock. Available: ${this.stockQuantity}, Requested: ${quantity}`);
  }
  
  // Only deduct stock if not allowing backorders
  if (!this.allowBackorders) {
    this.stockQuantity -= quantity;
    this.totalSold += quantity;
    this.lastSold = new Date();
    
    // Update inStock status
    this.inStock = this.stockQuantity > 0;
    
    // Update status if out of stock
    if (this.stockQuantity === 0 && !this.allowBackorders) {
      this.status = 'out_of_stock';
    }
  }
  
  return this.save();
};

// Method to restore stock (order cancellation)
productSchema.methods.restoreStock = async function(quantity) {
  if (this.trackInventory && !this.allowBackorders) {
    this.stockQuantity += quantity;
    this.totalSold = Math.max(0, this.totalSold - quantity);
    this.inStock = true;
    
    // Reactivate if was out of stock
    if (this.status === 'out_of_stock') {
      this.status = 'active';
    }
    
    return this.save();
  }
  return this;
};

// Method to update rating
productSchema.methods.updateRating = function(newRating) {
  const oldRatingCount = this.reviewCount;
  const oldTotalRating = this.rating * oldRatingCount;
  
  // Update ratings distribution
  if (newRating >= 1 && newRating <= 5) {
    this.ratingsDistribution[Math.round(newRating)]++;
  }
  
  // Calculate new average
  this.reviewCount++;
  this.rating = (oldTotalRating + newRating) / this.reviewCount;
  
  return this.save();
};

// Method to add multiple images
productSchema.methods.addImages = function(images) {
  if (!this.images) {
    this.images = [];
  }
  
  images.forEach(img => {
    this.images.push({
      url: img.url,
      type: img.type || 'url',
      isPrimary: img.isPrimary || false
    });
  });
  
  return this.save();
};

// Method to set primary image
productSchema.methods.setPrimaryImage = function(imageIndex) {
  if (this.images && this.images[imageIndex]) {
    // Reset all images to non-primary
    this.images.forEach(img => {
      img.isPrimary = false;
    });
    
    // Set the selected image as primary
    this.images[imageIndex].isPrimary = true;
    
    // Also update the main image field
    this.image = this.images[imageIndex].url;
    this.imageType = this.images[imageIndex].type;
    
    return this.save();
  }
  throw new Error('Image not found');
};

// Method to remove image
productSchema.methods.removeImage = function(imageIndex) {
  if (this.images && this.images[imageIndex]) {
    const removedImage = this.images.splice(imageIndex, 1)[0];
    
    // If removed image was primary, set another as primary
    if (removedImage.isPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
      this.image = this.images[0].url;
      this.imageType = this.images[0].type;
    } else if (this.images.length === 0) {
      this.image = '';
      this.imageType = 'url';
    }
    
    return this.save();
  }
  throw new Error('Image not found');
};

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    // Generate a simple SKU: first 3 letters of category + timestamp
    const categoryPrefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryPrefix}${timestamp}`;
  }
  
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Update inStock based on stock quantity
  if (this.trackInventory) {
    this.inStock = this.stockQuantity > 0 || this.allowBackorders;
  }
  
  // Ensure images array has proper structure
  if (this.images && this.images.length > 0) {
    this.images = this.images.map((img, index) => {
      if (typeof img === 'string') {
        return {
          url: img,
          type: 'url',
          isPrimary: index === 0
        };
      }
      return img;
    });
    
    // Ensure at least one primary image
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Pre-remove middleware to delete uploaded files
productSchema.pre('remove', function(next) {
  // Delete uploaded image files when product is removed
  if (this.imageType === 'upload' && this.image) {
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, '..', this.image);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  
  // Delete additional uploaded images
  if (this.images) {
    const fs = require('fs');
    const path = require('path');
    
    this.images.forEach(img => {
      if (img.type === 'upload' && img.url) {
        const imagePath = path.join(__dirname, '..', img.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });
  }
  
  next();
});

// Static method to find low stock products
productSchema.statics.findLowStock = function() {
  return this.find({
    trackInventory: true,
    stockQuantity: { $lte: '$lowStockAlert' },
    stockQuantity: { $gt: 0 }
  });
};

// Static method to find out of stock products
productSchema.statics.findOutOfStock = function() {
  return this.find({
    $or: [
      { trackInventory: true, stockQuantity: 0, allowBackorders: false },
      { inStock: false },
      { status: 'out_of_stock' }
    ]
  });
};

// Static method to find products by image type
productSchema.statics.findByImageType = function(imageType) {
  return this.find({ imageType });
};

// Static method to cleanup orphaned uploaded images
productSchema.statics.cleanupOrphanedImages = async function() {
  const fs = require('fs');
  const path = require('path');
  
  // Get all products with uploaded images
  const products = await this.find({
    $or: [
      { imageType: 'upload' },
      { 'images.type': 'upload' }
    ]
  });
  
  const uploadDir = path.join(__dirname, '../uploads/products/');
  const usedImages = new Set();
  
  // Collect all used image paths
  products.forEach(product => {
    if (product.imageType === 'upload' && product.image) {
      usedImages.add(path.basename(product.image));
    }
    
    if (product.images) {
      product.images.forEach(img => {
        if (img.type === 'upload' && img.url) {
          usedImages.add(path.basename(img.url));
        }
      });
    }
  });
  
  // Find and delete orphaned files
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    
    files.forEach(file => {
      if (!usedImages.has(file)) {
        const filePath = path.join(uploadDir, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted orphaned image: ${file}`);
      }
    });
  }
};

// Index for better performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ slug: 1 }, { unique: true, sparse: true });
productSchema.index({ 'rating': -1, 'reviewCount': -1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ imageType: 1 });
productSchema.index({ 'images.type': 1 });

module.exports = mongoose.model('Product', productSchema);
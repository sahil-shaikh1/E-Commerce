const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get dashboard statistics
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const revenue = totalRevenue[0] ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: revenue,
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderNumber: `ORD${order._id.toString().slice(-6).toUpperCase()}`,
          customer: order.userId?.fullName || 'N/A',
          amount: order.totalAmount,
          status: order.status,
          date: order.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// Get all products with pagination
router.get('/products', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments()
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Create new product
// router.post('/products', adminAuth, async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       price,
//       category,
//       image,
//       inStock,
//       fastDelivery,
//       stockQuantity
//     } = req.body;

//     const product = new Product({
//       name,
//       description,
//       price,
//       category,
//       image,
//       inStock: inStock !== undefined ? inStock : true,
//       fastDelivery: fastDelivery !== undefined ? fastDelivery : false,
//       stockQuantity: stockQuantity || 0
//     });

//     await product.save();

//     res.status(201).json({
//       success: true,
//       message: 'Product created successfully',
//       product
//     });
//   } catch (error) {
//     console.error('Create product error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating product'
//     });
//   }
// });
// Create new product - UPDATED TO HANDLE FORMDATA
router.post('/products', adminAuth, async (req, res) => {
  try {
    let imageUrl = '';
    
    // Handle file upload if image file is provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      
      // Validate file type
      if (!imageFile.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }
      
      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image size should be less than 5MB'
        });
      }
      
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'product-' + uniqueSuffix + path.extname(imageFile.name);
      
      // Define upload path
      const uploadPath = path.join(__dirname, '../uploads/products', filename);
      
      // Ensure uploads directory exists
      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Move file to uploads directory
      await imageFile.mv(uploadPath);
      
      // Set image URL to the uploaded file path
      imageUrl = `/uploads/products/${filename}`;
    } else if (req.body.imageUrl) {
      // Handle image URL from form data
      imageUrl = req.body.imageUrl;
    }
    
    // If no image provided (neither URL nor file)
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    // Extract and validate fields from FormData
    const name = req.body.name ? req.body.name.toString().trim() : '';
    const description = req.body.description ? req.body.description.toString().trim() : '';
    const price = req.body.price ? parseFloat(req.body.price) : NaN;
    const category = req.body.category ? req.body.category.toString().trim() : '';
    const stockQuantity = req.body.stockQuantity ? parseInt(req.body.stockQuantity) : 0;
    const inStock = req.body.inStock ? req.body.inStock === 'true' : true;
    const fastDelivery = req.body.fastDelivery ? req.body.fastDelivery === 'true' : false;

    console.log('📦 Parsed product data:', {
      name, description, price, category, stockQuantity, inStock, fastDelivery, imageUrl
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Product description is required'
      });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid product price is required'
      });
    }
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required'
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image: imageUrl,
      inStock,
      fastDelivery,
      stockQuantity
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product: ' + error.message
    });
  }
});

// Update product
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments()
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Update order status
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// Get order details
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
});

module.exports = router;

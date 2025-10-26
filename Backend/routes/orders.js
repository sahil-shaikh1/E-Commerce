// routes/orders.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Add this import

// Create new order WITH STOCK REDUCTION
router.post('/', auth, async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      items,
      totalAmount,
      subtotal,
      shipping,
      tax
    } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // VALIDATE STOCK AVAILABILITY BEFORE CREATING ORDER
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        });
      }
    }

    // REDUCE STOCK QUANTITIES
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stockQuantity: -item.quantity }
        },
        { new: true }
      );
      
      console.log(`✅ Reduced stock for product ${item.productId} by ${item.quantity} units`);
    }

    // Create new order
    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      subtotal: subtotal || totalAmount,
      shipping: shipping || 0,
      tax: tax || 0,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      isPaid: paymentMethod !== 'cod',
      status: 'processing'
    });

    await order.save();

    // Populate the order with product details
    await order.populate('items.productId');

    console.log(`✅ Order created successfully: ${order._id}`);
    console.log(`📦 Stock reduced for ${items.length} products`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully and stock updated',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
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

    // Check if user owns the order or is admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Cancel order and restore stock (optional)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow cancellation for pending/processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // RESTORE STOCK QUANTITIES
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stockQuantity: item.quantity }
        },
        { new: true }
      );
      
      console.log(`🔄 Restored stock for product ${item.productId} by ${item.quantity} units`);
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled and stock restored',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

module.exports = router;

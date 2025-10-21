const User = require('../models/User');

// Wishlist functions
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    
    res.json({
      success: true,  // Add this
      wishlist: user.wishlist,  // Keep this
      message: 'Wishlist fetched successfully'  // Add this
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ 
      success: false,  // Add this
      message: 'Server error while fetching wishlist' 
    });
  }
};
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    await user.populate('wishlist');
    res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    await user.populate('wishlist');
    res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
};

// Cart functions - UPDATED WITH PROPER RESPONSE FORMAT
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    res.json({
      success: true,
      cart: user.cart,
      message: 'Cart fetched successfully'
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching cart' 
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    await user.populate('cart.product');

    res.json({ 
      success: true,
      message: 'Product added to cart', 
      cart: user.cart 
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding to cart' 
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user._id);
    const cartItem = user.cart.find(item => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }

    if (quantity < 1) {
      user.cart = user.cart.filter(item => item.product.toString() !== productId);
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();
    await user.populate('cart.product');

    res.json({ 
      success: true,
      message: 'Cart updated', 
      cart: user.cart 
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating cart' 
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    await user.populate('cart.product');

    res.json({ 
      success: true,
      message: 'Item removed from cart', 
      cart: user.cart 
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while removing from cart' 
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared successfully', cart: [] });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
};
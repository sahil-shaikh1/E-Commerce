const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    console.log('Getting products...');
    const products = await Product.find();
    res.json({ 
      success: true,
      products,
      total: products.length 
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching products' 
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    res.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching product' 
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ 
      success: true,
      categories 
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching categories' 
    });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, category, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    const missing = [];
    if (!name) missing.push('name');
    if (!price) missing.push('price');
    if (!category) missing.push('category');
    if (!image) missing.push('image');

    if (missing.length) {
      return res.status(400).json({ message: 'Missing required fields', missing });
    }

    const product = new Product({ name, price, category, description, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err); // will be handled by errorHandler middleware
  }
};

// server.js - Add admin routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const orderRoutes = require('./routes/orders');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running!' });
});

// Import and use routes
try {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const userRoutes = require('./routes/users');
  const adminRoutes = require('./routes/admin'); // Add this line
  
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes); // Add this line
   app.use('/api/orders', orderRoutes);
  
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
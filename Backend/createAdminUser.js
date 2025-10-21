// createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check which collections exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));

    // Check if admin exists in users collection
    const usersCollection = db.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: 'admin@cherishindia.com' });
    
    if (existingAdmin) {
      console.log('\n✅ Admin user already exists in users collection:');
      console.log('   📧 Email:', existingAdmin.email);
      console.log('   👤 Role:', existingAdmin.role);
      console.log('   🆔 ID:', existingAdmin._id);
      console.log('\n💡 You can use these credentials to login:');
      console.log('   Email: admin@cherishindia.com');
      console.log('   Password: admin123');
      return;
    }

    // Create admin user in users collection
    const adminUser = {
      fullName: 'System Administrator',
      email: 'admin@cherishindia.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdCvWfDPqZG.5la', // admin123
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(adminUser);
    
    console.log('\n🎉 Admin user created successfully in users collection!');
    console.log('=========================================');
    console.log('   📧 Email: admin@cherishindia.com');
    console.log('   🔑 Password: admin123');
    console.log('   👤 Role: admin');
    console.log('   🆔 ID:', result.insertedId);
    console.log('=========================================');
    console.log('\n💡 You can now use these credentials to login to the admin panel.');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
    process.exit(0);
  }
};

// Run the function
createAdminUser();
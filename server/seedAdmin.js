import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config(); // Load .env file
const seedAdmin = async () => {
    try {
    await connectDB()
    const existingAdmin = await User.findOne({ role: 'Admin' });

    if (existingAdmin) {
      console.log('✅ Admin already exists.');
    } else {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);

      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'Admin',
      });

      console.log('✅ Admin user created successfully!');
    }

    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
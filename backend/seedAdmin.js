const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    const existing = await User.findOne({ email: 'admin@ews.com' });
    if (existing) {
      console.log('Admin already exists! Email: admin@ews.com');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@ews.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin created successfully!');
    console.log('   Email:    admin@ews.com');
    console.log('   Password: admin123');
    console.log('   ID:      ', admin._id);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createAdmin();
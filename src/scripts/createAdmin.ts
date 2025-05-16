// Script to insert an admin user directly into the database
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User';

const MONGO_URI = process.env.MONGO_URI || '';

async function createAdmin() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const email = 'admin@example.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists:', email);
    process.exit(0);
  }
  await User.create({ email, password: hashed, role: 'admin', createdAt: new Date() });
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });

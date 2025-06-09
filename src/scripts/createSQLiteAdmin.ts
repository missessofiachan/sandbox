import 'reflect-metadata';
import { DataSource } from 'typeorm';
import UserSQLite from '../entities/sqlite/user';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Admin user data
const adminUser = {
  email: 'admin@example.com',
  password: '$2b$10$4or1EcX/cAdDwxpQpBlmNOE.wzn.ikNUncw.hATVUFyW9hjUh7/92', // pre-hashed admin123
  role: 'admin' as const,
  createdAt: new Date('2025-06-09T00:00:00Z'),
};

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.SQLITE_DB_PATH || './data/sandbox.db',
  entities: [UserSQLite],
  synchronize: true, // Auto-create tables
  logging: false,
});

async function insertAdmin(): Promise<void> {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(UserSQLite);

    // Check if user already exists
    const exists = await userRepo.findOneBy({ email: adminUser.email });
    if (exists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    await userRepo.insert(adminUser);
    console.log('Admin user inserted successfully into SQLite database.');
    process.exit(0);
  } catch (err) {
    console.error('Error inserting admin user:', err);
    process.exit(1);
  }
}

insertAdmin();

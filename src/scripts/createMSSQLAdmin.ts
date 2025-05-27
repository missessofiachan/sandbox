import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/user'; // If 'default', use: import User from '../entities/user'
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Adjust the type of 'role' to match the User entity definition
const adminUser = {
  email: 'admin@example.com',
  password: '$2b$10$4or1EcX/cAdDwxpQpBlmNOE.wzn.ikNUncw.hATVUFyW9hjUh7/92',
  role: 'admin' as 'admin', // Explicitly type as the union literal
  createdAt: new Date('2025-05-10T00:00:00Z'),
};

const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.MSSQL_HOST,
  port: Number(process.env.MSSQL_PORT),
  username: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DB,
  entities: [User],
  synchronize: false,
  options: { encrypt: false },
  extra: {
    server: process.env.MSSQL_HOST,
  },
});

async function insertAdmin(): Promise<void> {
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);
    // Check if user already exists
    const exists = await userRepo.findOneBy({ email: adminUser.email });
    if (exists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }
    await userRepo.insert(adminUser);
    console.log('Admin user inserted successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error inserting admin user:', err);
    process.exit(1);
  }
}

insertAdmin();

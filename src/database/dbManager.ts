// Database connection manager
import mongoose from 'mongoose';
import { DataSource } from "typeorm";
import { logger } from '../utils/logger';
import Product from '../entities/Product';
import User from '../entities/user';
import Order from '../entities/orders';

// Class to manage database connections
class DBManager {
  private static instance: DBManager;
  private mongoConnected: boolean = false;
  private mssqlConnected: boolean = false;
  private mssqlDataSource: DataSource | null = null;
  
  // Singleton pattern
  public static getInstance(): DBManager {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();
    }
    return DBManager.instance;
  }

  // Connect to MongoDB
  public async connectMongo(): Promise<boolean> {
    if (this.mongoConnected) return true;
    
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      logger.error('MONGO_URI is not defined in environment variables.');
      return false;
    }

    try {
      await mongoose.connect(MONGO_URI);
      this.mongoConnected = true;
      logger.info('Connected to MongoDB');
      return true;
    } catch (err) {
      logger.error(`MongoDB connection error: ${err}`);
      return false;
    }
  }

  // Connect to MSSQL
  public async connectMSSQL(): Promise<boolean> {
    if (this.mssqlConnected && this.mssqlDataSource) return true;
    
    try {
      // Debug: print env variables
      logger.debug('MSSQL_HOST:', process.env.MSSQL_HOST);
      logger.debug('MSSQL_PORT:', process.env.MSSQL_PORT);
      logger.debug('MSSQL_USER:', process.env.MSSQL_USER);
      logger.debug('MSSQL_DB:', process.env.MSSQL_DB);

      this.mssqlDataSource = new DataSource({
        type: "mssql",
        host: process.env.MSSQL_HOST,
        port: Number(process.env.MSSQL_PORT),
        username: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        database: process.env.MSSQL_DB,
        entities: [Product, User, Order],
        synchronize: false, // Prevents table recreation errors
        options: {
          encrypt: false,
          trustServerCertificate: true
        },
        extra: {
          validateConnection: false,
          trustServerCertificate: true
        }
      });

      await this.mssqlDataSource.initialize();
      this.mssqlConnected = true;
      logger.info('Connected to MSSQL');
      return true;
    } catch (err) {
      logger.error(`MSSQL connection error: ${err}`);
      this.mssqlDataSource = null;
      return false;
    }
  }

  // Get MSSQL data source
  public getMSSQLDataSource(): DataSource | null {
    return this.mssqlDataSource;
  }

  // Check MongoDB connection status
  public isMongoConnected(): boolean {
    return this.mongoConnected && mongoose.connection.readyState === 1;
  }

  // Check MSSQL connection status
  public isMSSQLConnected(): boolean {
    return this.mssqlConnected && this.mssqlDataSource !== null && this.mssqlDataSource.isInitialized;
  }

  // Connect to the appropriate database based on DB_TYPE
  public async connect(): Promise<boolean> {
    const dbType = process.env.DB_TYPE || 'mongo';
    
    if (dbType === 'mssql') {
      return this.connectMSSQL();
    } else {
      return this.connectMongo();
    }
  }

  // Close all connections
  public async closeConnections(): Promise<void> {
    if (this.mongoConnected) {
      await mongoose.disconnect();
      this.mongoConnected = false;
      logger.info('Disconnected from MongoDB');
    }
    
    if (this.mssqlConnected && this.mssqlDataSource) {
      await this.mssqlDataSource.destroy();
      this.mssqlConnected = false;
      this.mssqlDataSource = null;
      logger.info('Disconnected from MSSQL');
    }
  }
}

// Export singleton instance
export const dbManager = DBManager.getInstance();

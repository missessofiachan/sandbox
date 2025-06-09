// Database connection manager
import mongoose from 'mongoose';
import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import Product from '../entities/mssql/Product';
import User from '../entities/mssql/user';
import Order from '../entities/mssql/orders';
// SQLite entities
import ProductSQLite from '../entities/sqlite/product';
import UserSQLite from '../entities/sqlite/user';
import OrderSQLite from '../entities/sqlite/order';
import process from 'process';

// Class to manage database connections
class DBManager {
  private static instance: DBManager;
  private mongoConnected: boolean = false;
  private mssqlConnected: boolean = false;
  private mssqlDataSource: DataSource | null = null;
  private sqliteConnected: boolean = false;
  private sqliteDataSource: DataSource | null = null;

  // Singleton pattern
  public static getInstance(): DBManager {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();
    }
    return DBManager.instance;
  } // Connect to MongoDB with optimized connection pooling
  public async connectMongo(): Promise<boolean> {
    if (this.mongoConnected) return true;

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      logger.error('MONGO_URI is not defined in environment variables.');
      return false;
    }

    try {
      const mongoOptions = {
        // Connection Pool Settings
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10, // Maximum number of connections in the pool
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 2, // Minimum number of connections in the pool
        maxIdleTimeMS: Number(process.env.MONGO_MAX_IDLE_TIME_MS) || 30000, // Close connections after 30 seconds of inactivity

        // Connection Timeout Settings
        serverSelectionTimeoutMS:
          Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000, // How long to try to connect
        socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000, // How long a send or receive on a socket can take
        connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000, // How long to wait for initial connection

        // Heartbeat and Monitoring
        heartbeatFrequencyMS:
          Number(process.env.MONGO_HEARTBEAT_FREQUENCY_MS) || 10000, // Frequency of heartbeat checks

        // Buffer Settings
        bufferCommands: false, // Disable mongoose buffering

        // Replica Set Settings (if using replica sets)
        readPreference:
          (process.env
            .MONGO_READ_PREFERENCE as mongoose.mongo.ReadPreferenceMode) ||
          'primary',

        // Retry Settings
        retryWrites: process.env.MONGO_RETRY_WRITES !== 'false',
        retryReads: process.env.MONGO_RETRY_READS !== 'false',

        // Compression
        compressors: (process.env.MONGO_COMPRESSORS?.split(',') as (
          | 'zlib'
          | 'none'
          | 'snappy'
          | 'zstd'
        )[]) || ['zlib'],

        // Authentication and Security
        authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
      };

      await mongoose.connect(MONGO_URI, mongoOptions);
      this.mongoConnected = true;

      // Log connection pool configuration
      logger.info(
        'Connected to MongoDB with optimized connection pool settings',
        {
          maxPoolSize: mongoOptions.maxPoolSize,
          minPoolSize: mongoOptions.minPoolSize,
          maxIdleTimeMS: mongoOptions.maxIdleTimeMS,
          serverSelectionTimeoutMS: mongoOptions.serverSelectionTimeoutMS,
        }
      );

      return true;
    } catch (err) {
      logger.error(`MongoDB connection error: ${err}`);
      return false;
    }
  }
  // Connect to MSSQL with optimized connection pooling
  public async connectMSSQL(): Promise<boolean> {
    if (this.mssqlConnected && this.mssqlDataSource) return true;

    try {
      // Debug: print env variables
      logger.debug('MSSQL_HOST:', process.env.MSSQL_HOST);
      logger.debug('MSSQL_PORT:', process.env.MSSQL_PORT);
      logger.debug('MSSQL_USER:', process.env.MSSQL_USER);
      logger.debug('MSSQL_DB:', process.env.MSSQL_DB);
      this.mssqlDataSource = new DataSource({
        type: 'mssql',
        host: process.env.MSSQL_HOST,
        port: Number(process.env.MSSQL_PORT),
        username: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        database: process.env.MSSQL_DB,
        entities: [Product, User, Order],
        synchronize: false, // Prevents table recreation errors

        // Connection Pool Configuration
        extra: {
          // Connection Pool Settings
          pool: {
            max: Number(process.env.MSSQL_POOL_MAX) || 10, // Maximum connections
            min: Number(process.env.MSSQL_POOL_MIN) || 2, // Minimum connections
            acquireTimeoutMillis:
              Number(process.env.MSSQL_ACQUIRE_TIMEOUT_MS) || 60000, // Timeout acquiring connection
            idleTimeoutMillis:
              Number(process.env.MSSQL_IDLE_TIMEOUT_MS) || 30000, // Idle timeout
            createTimeoutMillis:
              Number(process.env.MSSQL_CREATE_TIMEOUT_MS) || 30000, // Creation timeout
            destroyTimeoutMillis:
              Number(process.env.MSSQL_DESTROY_TIMEOUT_MS) || 5000, // Destruction timeout
            reapIntervalMillis:
              Number(process.env.MSSQL_REAP_INTERVAL_MS) || 1000, // Cleanup interval
            createRetryIntervalMillis:
              Number(process.env.MSSQL_CREATE_RETRY_INTERVAL_MS) || 200, // Retry interval
          },

          // Connection Options
          connectionTimeout:
            Number(process.env.MSSQL_CONNECTION_TIMEOUT_MS) || 15000, // Connection timeout
          requestTimeout: Number(process.env.MSSQL_REQUEST_TIMEOUT_MS) || 15000, // Request timeout
          cancelTimeout: Number(process.env.MSSQL_CANCEL_TIMEOUT_MS) || 5000, // Cancel timeout

          // Security Settings
          encrypt: process.env.MSSQL_ENCRYPT === 'true' || false,
          trustServerCertificate:
            process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',

          // Additional Settings
          validateConnection: process.env.MSSQL_VALIDATE_CONNECTION !== 'false',
          enableArithAbort: process.env.MSSQL_ENABLE_ARITH_ABORT !== 'false',

          // Connection retry settings
          maxRetriesOnFailover:
            Number(process.env.MSSQL_MAX_RETRIES_ON_FAILOVER) || 3,
          maxRetriesOnTransientErrors:
            Number(process.env.MSSQL_MAX_RETRIES_ON_TRANSIENT_ERRORS) || 3,

          // Performance settings
          packetSize: Number(process.env.MSSQL_PACKET_SIZE) || 4096,

          // Application name for monitoring
          appName: process.env.MSSQL_APP_NAME || 'SandboxAPI',
        },

        // Legacy options support
        options: {
          encrypt: process.env.MSSQL_ENCRYPT === 'true' || false,
          trustServerCertificate:
            process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
        },
      });

      await this.mssqlDataSource.initialize();
      this.mssqlConnected = true;

      // Log connection pool configuration
      logger.info(
        'Connected to MSSQL with optimized connection pool settings',
        {
          poolSize: Number(process.env.MSSQL_POOL_SIZE) || 10,
          poolMax: Number(process.env.MSSQL_POOL_MAX) || 10,
          poolMin: Number(process.env.MSSQL_POOL_MIN) || 2,
          connectionTimeout:
            Number(process.env.MSSQL_CONNECTION_TIMEOUT_MS) || 15000,
          requestTimeout: Number(process.env.MSSQL_REQUEST_TIMEOUT_MS) || 15000,
        }
      );

      return true;
    } catch (err) {
      logger.error(`MSSQL connection error: ${err}`);
      this.mssqlDataSource = null;
      return false;
    }
  }

  // Connect to SQLite with optimized settings
  public async connectSQLite(): Promise<boolean> {
    if (this.sqliteConnected && this.sqliteDataSource) return true;

    try {
      const dbPath = process.env.SQLITE_DB_PATH || './data/sandbox.db';
      
      this.sqliteDataSource = new DataSource({
        type: 'better-sqlite3',
        database: dbPath,
        entities: [ProductSQLite, UserSQLite, OrderSQLite],
        synchronize: process.env.SQLITE_SYNCHRONIZE === 'true' || true, // Auto-create tables in development
        logging: process.env.SQLITE_LOGGING === 'true' || false,
        
        // Better-sqlite3 specific options
        verbose: process.env.SQLITE_VERBOSE === 'true' ? console.log : undefined,
        fileMustExist: process.env.SQLITE_FILE_MUST_EXIST === 'true' || false,
        timeout: Number(process.env.SQLITE_TIMEOUT) || 5000,
        readonly: process.env.SQLITE_READONLY === 'true' || false,
      });

      await this.sqliteDataSource.initialize();
      this.sqliteConnected = true;

      // Log connection configuration
      logger.info('Connected to SQLite database', {
        database: dbPath,
        synchronize: process.env.SQLITE_SYNCHRONIZE === 'true' || true,
        logging: process.env.SQLITE_LOGGING === 'true' || false,
      });

      return true;
    } catch (err) {
      logger.error(`SQLite connection error: ${err}`);
      this.sqliteDataSource = null;
      return false;
    }
  }

  // Get MSSQL data source
  public getMSSQLDataSource(): DataSource | null {
    return this.mssqlDataSource;
  }

  // Get SQLite data source
  public getSQLiteDataSource(): DataSource | null {
    return this.sqliteDataSource;
  }

  // Check MongoDB connection status
  public isMongoConnected(): boolean {
    return this.mongoConnected && mongoose.connection.readyState === 1;
  }

  // Check MSSQL connection status
  public isMSSQLConnected(): boolean {
    return (
      this.mssqlConnected &&
      this.mssqlDataSource !== null &&
      this.mssqlDataSource.isInitialized
    );
  }

  // Check SQLite connection status
  public isSQLiteConnected(): boolean {
    return (
      this.sqliteConnected &&
      this.sqliteDataSource !== null &&
      this.sqliteDataSource.isInitialized
    );
  }

  // Connect to the appropriate database based on DB_TYPE
  public async connect(): Promise<boolean> {
    const dbType = process.env.DB_TYPE || 'mongo';

    if (dbType === 'mssql') {
      return this.connectMSSQL();
    } else if (dbType === 'sqlite') {
      return this.connectSQLite();
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

    if (this.sqliteConnected && this.sqliteDataSource) {
      await this.sqliteDataSource.destroy();
      this.sqliteConnected = false;
      this.sqliteDataSource = null;
      logger.info('Disconnected from SQLite');
    }
  }
  // Get MongoDB connection pool statistics
  public getMongoPoolStats(): unknown {
    if (!this.mongoConnected || !mongoose.connection.db) {
      return null;
    }

    const connection = mongoose.connection;
    return {
      readyState: connection.readyState,
      readyStateString: [
        'disconnected',
        'connected',
        'connecting',
        'disconnecting',
      ][connection.readyState],
      host: connection.host,
      port: connection.port,
      name: connection.name,
      // Pool statistics from the underlying driver (may not be available in all versions)
      poolSize: 'available via driver stats',
      poolConnections: 'available via driver stats',
    };
  }
  // Get MSSQL connection pool statistics
  public getMSSQLPoolStats(): unknown {
    if (!this.mssqlConnected || !this.mssqlDataSource) {
      return null;
    }

    // Use a more specific type for options
    const options = this.mssqlDataSource.options as {
      host?: string;
      port?: number;
      database?: string;
      poolSize?: number;
      extra?: { pool?: unknown };
    };
    return {
      isInitialized: this.mssqlDataSource.isInitialized,
      options: {
        host: options.host || 'unknown',
        port: options.port || 'unknown',
        database: options.database || 'unknown',
        poolSize: options.poolSize || 'unknown',
      },
      // Additional pool stats if available
      poolConfiguration: options.extra?.pool || 'Pool config unavailable',
    };
  }

  // Get SQLite connection statistics
  public getSQLitePoolStats(): unknown {
    if (!this.sqliteConnected || !this.sqliteDataSource) {
      return null;
    }

    const options = this.sqliteDataSource.options as {
      database?: string;
      synchronize?: boolean;
      logging?: boolean;
    };
    
    return {
      isInitialized: this.sqliteDataSource.isInitialized,
      options: {
        database: options.database || 'unknown',
        synchronize: options.synchronize || false,
        logging: options.logging || false,
      },
      type: 'better-sqlite3',
      connectionType: 'file-based',
    };
  }
  // Get comprehensive database health information
  public async getDatabaseHealth(): Promise<unknown> {
    // Use a specific type for health
    interface HealthDbStats {
      connected: boolean;
      stats: unknown;
      ping?: string;
      pingError?: string;
    }
    const health: {
      timestamp: string;
      mongodb: HealthDbStats;
      mssql: HealthDbStats;
      sqlite: HealthDbStats;
    } = {
      timestamp: new Date().toISOString(),
      mongodb: {
        connected: this.isMongoConnected(),
        stats: this.getMongoPoolStats(),
      },
      mssql: {
        connected: this.isMSSQLConnected(),
        stats: this.getMSSQLPoolStats(),
      },
      sqlite: {
        connected: this.isSQLiteConnected(),
        stats: this.getSQLitePoolStats(),
      },
    };

    // Test actual connectivity
    if (this.isMongoConnected()) {
      try {
        await mongoose.connection.db?.admin().ping();
        health.mongodb.ping = 'success';
      } catch (err) {
        health.mongodb.ping = 'failed';
        health.mongodb.pingError = (err as Error).message;
      }
    }

    if (this.isMSSQLConnected() && this.mssqlDataSource) {
      try {
        await this.mssqlDataSource.query('SELECT 1');
        health.mssql.ping = 'success';
      } catch (err) {
        health.mssql.ping = 'failed';
        health.mssql.pingError = (err as Error).message;
      }
    }

    if (this.isSQLiteConnected() && this.sqliteDataSource) {
      try {
        await this.sqliteDataSource.query('SELECT 1');
        health.sqlite.ping = 'success';
      } catch (err) {
        health.sqlite.ping = 'failed';
        health.sqlite.pingError = (err as Error).message;
      }
    }

    return health;
  }
}

// Export singleton instance
export const dbManager = DBManager.getInstance();

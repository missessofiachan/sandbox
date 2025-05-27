import { DataSource } from 'typeorm';
import { dbManager } from './database/dbManager';
import { logger } from './utils/logger';

export const connectMSSQL = async (): Promise<DataSource | null> => {
  try {
    const success = await dbManager.connectMSSQL();
    if (!success) {
      logger.error('Failed to connect to MSSQL');
      return null;
    }
    return dbManager.getMSSQLDataSource();
  } catch (error) {
    logger.error(`Error connecting to MSSQL: ${error}`);
    return null;
  }
};

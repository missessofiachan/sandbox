import { DataSource } from "typeorm";
import Product from "./entities/Product";

export const connectMSSQL = async () => {
  // Debug: print env variables
  console.log('MSSQL_HOST:', process.env.MSSQL_HOST);
  console.log('MSSQL_PORT:', process.env.MSSQL_PORT);
  console.log('MSSQL_USER:', process.env.MSSQL_USER);
  console.log('MSSQL_PASSWORD:', process.env.MSSQL_PASSWORD);
  console.log('MSSQL_DB:', process.env.MSSQL_DB);

  const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.MSSQL_HOST,
    port: Number(process.env.MSSQL_PORT),
    username: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DB,
    entities: [Product],
    synchronize: true,
    options: {
      encrypt: false,
      trustServerCertificate: true
    },
    extra: {
      validateConnection: false,
      trustServerCertificate: true
    }
  });

  return await AppDataSource.initialize();
};

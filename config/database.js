// src/config/database.mjs
import dotenv from 'dotenv';

dotenv.config();

const databaseConfig = {
  development: {
    username: process.env.DB_USER || 'local_user',
    password: 'local_password',
    database: process.env.DB_NAME || 'local_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

export default databaseConfig;
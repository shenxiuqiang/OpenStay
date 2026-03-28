/* eslint-disable @typescript-eslint/indent */
import { Sequelize } from 'sequelize';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'property.db');

// SQLite for development, PostgreSQL for production
const sequelize =
  env === 'production' && process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      })
    : new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: env === 'development' ? console.log : false,
      });

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

export async function syncDatabase(force = false): Promise<void> {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
}

export { sequelize };
export default sequelize;

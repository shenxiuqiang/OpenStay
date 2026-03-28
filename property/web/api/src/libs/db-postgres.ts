import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 数据库配置
const dbConfig: Options = {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'openstay',
  username: process.env.DB_USER || 'openstay',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: process.env.DB_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
};

// 优先使用 DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      } : {},
    })
  : new Sequelize(dbConfig);

// 测试连接
export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
    return false;
  }
}

// 同步数据库
export async function syncDatabase(force = false): Promise<void> {
  try {
    await sequelize.sync({ force });
    console.log(`✅ Database synchronized${force ? ' (forced)' : ''}`);
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
    throw error;
  }
}

// 关闭连接
export async function closeConnection(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

export default sequelize;

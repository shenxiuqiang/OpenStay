#!/usr/bin/env node
/**
 * OpenStay MCP Server Standalone
 * 
 * Run MCP server as a standalone process (stdio transport)
 */

import { createMCPServer } from '@openstay/mcp';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../property/web/.env') });

async function main() {
  // Initialize database connection
  const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../data/openstay.db');
  
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });

  // Test database connection
  try {
    await sequelize.authenticate();
    console.error('✅ Database connection established');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }

  // Create and start MCP server
  const server = await createMCPServer({
    sequelize,
    transport: 'stdio',
  });

  await server.start();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

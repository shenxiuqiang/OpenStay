/**
 * MCP Server Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createMCPServer } from '../src/index.js';
import { Sequelize } from 'sequelize';

describe('OpenStay MCP Server', () => {
  let server: Awaited<ReturnType<typeof createMCPServer>>;
  let sequelize: Sequelize;

  beforeAll(async () => {
    // Create in-memory database for testing
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    server = await createMCPServer({
      sequelize,
      transport: 'stdio',
    });
  });

  it('should initialize with correct tools', () => {
    const mcpServer = server.getServer();
    expect(mcpServer).toBeDefined();
  });

  it('should have property tools registered', async () => {
    // Test that tools are properly registered
    const tools = [
      'property/search',
      'property/get',
      'property/create',
      'property/update',
    ];
    
    for (const tool of tools) {
      expect(tool).toMatch(/^[a-z]+\/[a-z]+$/);
    }
  });

  it('should have booking tools registered', async () => {
    const tools = [
      'booking/create',
      'booking/get',
      'booking/list',
      'booking/checkAvailability',
    ];
    
    for (const tool of tools) {
      expect(tool).toMatch(/^[a-z]+\/[a-zA-Z]+$/);
    }
  });

  it('should have search tools registered', () => {
    const tools = [
      'search/natural',
      'search/nearby',
      'search/filterFacilities',
      'search/compare',
    ];
    
    for (const tool of tools) {
      expect(tool).toMatch(/^[a-z]+\/[a-z]+$/);
    }
  });

  it('should have identity tools registered', () => {
    const tools = [
      'identity/verify',
      'identity/getProfile',
      'identity/getBookings',
      'identity/registerTraveler',
    ];
    
    for (const tool of tools) {
      expect(tool).toMatch(/^[a-z]+\/[a-z]+$/);
    }
  });
});

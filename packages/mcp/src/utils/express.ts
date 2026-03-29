/**
 * Express MCP Integration
 * 
 * Integrates MCP server with Express for HTTP transport
 */

import { Router, Request, Response } from 'express';
import type { Sequelize } from 'sequelize';
import { OpenStayMCPServer } from '../index.js';

export interface MCPExpressConfig {
  sequelize: Sequelize;
  path?: string;
}

export function createMCPRouter(config: MCPExpressConfig): Router {
  const router = Router();
  const mcpPath = config.path || '/mcp';

  // Initialize MCP Server
  let mcpServer: OpenStayMCPServer | null = null;
  
  async function getServer(): Promise<OpenStayMCPServer> {
    if (!mcpServer) {
      mcpServer = new OpenStayMCPServer({
        sequelize: config.sequelize,
        transport: 'http',
      });
      await mcpServer.initialize();
    }
    return mcpServer;
  }

  // MCP POST endpoint for JSON-RPC requests
  router.post(mcpPath, async (req: Request, res: Response) => {
    try {
      // For now, return a simple response
      // Full JSON-RPC handling would require the MCP SDK HTTP transport
      res.json({
        jsonrpc: '2.0',
        result: {
          status: 'ok',
          message: 'MCP endpoint is active',
          tools: [
            'property/search',
            'property/get',
            'booking/create',
            'booking/get',
            'search/natural',
            'search/nearby',
          ],
        },
        id: req.body?.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message,
        },
        id: req.body?.id,
      });
    }
  });

  // MCP GET endpoint for SSE (Server-Sent Events) - if needed
  router.get(mcpPath, async (req: Request, res: Response) => {
    // For SSE-based MCP, set up the stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection message
    res.write('data: {\"type\": \"connected\"}\n\n');

    // Keep connection open
    const keepAlive = setInterval(() => {
      res.write('data: {\"type\": \"ping\"}\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });
  });

  // Health check endpoint
  router.get(`${mcpPath}/health`, async (_req: Request, res: Response) => {
    try {
      await getServer();
      res.json({
        status: 'healthy',
        mcp: true,
        version: '0.1.0',
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        mcp: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

export default createMCPRouter;

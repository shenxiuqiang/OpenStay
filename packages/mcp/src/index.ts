/**
 * OpenStay MCP Server
 * 
 * Model Context Protocol implementation for OpenStay decentralized accommodation platform.
 * Exposes property management, booking, and payment capabilities to AI agents.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import type { Sequelize } from 'sequelize';

// Tool handler type
type ToolHandler = (args: any, config: MCPServerConfig) => Promise<any>;

// Tool definition with metadata
interface ToolDefinition {
  handler: ToolHandler;
  description: string;
  inputSchema: object;
}

export interface MCPServerConfig {
  name?: string;
  version?: string;
  sequelize: Sequelize;
  transport?: 'stdio' | 'http';
}

export class OpenStayMCPServer {
  private server: Server;
  private config: MCPServerConfig;
  private tools: Map<string, ToolDefinition> = new Map();
  private resources: Map<string, Function> = new Map();

  constructor(config: MCPServerConfig) {
    this.config = config;
    
    this.server = new Server(
      {
        name: config.name || 'openstay-mcp-server',
        version: config.version || '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // Execute tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const tool = this.tools.get(name);
      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Tool not found: ${name}`
        );
      }

      try {
        const result = await tool.handler(args, this.config);
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`);
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.getResourceDefinitions(),
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      // Parse URI to find matching resource handler
      for (const [pattern, handler] of this.resources.entries()) {
        const match = this.matchUri(pattern, uri);
        if (match) {
          try {
            const result = await handler(match, this.config);
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new McpError(ErrorCode.InternalError, `Resource read failed: ${message}`);
          }
        }
      }

      throw new McpError(ErrorCode.InvalidRequest, `Resource not found: ${uri}`);
    });
  }

  private matchUri(pattern: string, uri: string): Record<string, string> | null {
    // Convert pattern like "property://{id}/details" to regex
    const regexPattern = pattern
      .replace(/\{([^}]+)\}/g, '(?<$1>[^/]+)')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = uri.match(regex);
    
    return match ? match.groups || {} : null;
  }

  private getToolDefinitions() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  private getResourceDefinitions() {
    return Array.from(this.resources.keys()).map((pattern) => ({
      uri: pattern,
      name: pattern,
      mimeType: 'application/json',
    }));
  }

  registerTool(name: string, description: string, inputSchema: object, handler: ToolHandler): void {
    this.tools.set(name, { handler, description, inputSchema });
  }

  registerResource(pattern: string, handler: Function): void {
    this.resources.set(pattern, handler);
  }

  async initialize(): Promise<void> {
    // Register all tools from modules
    const { registerPropertyTools, propertyResources } = await import('./tools/property.js');
    const { registerBookingTools, bookingResources } = await import('./tools/booking.js');
    const { registerSearchTools } = await import('./tools/search.js');
    const { registerIdentityTools, identityResources } = await import('./tools/identity.js');

    registerPropertyTools(this);
    registerBookingTools(this);
    registerSearchTools(this);
    registerIdentityTools(this);

    // Register all resources
    for (const [pattern, handler] of Object.entries(propertyResources)) {
      this.registerResource(pattern, handler);
    }
    for (const [pattern, handler] of Object.entries(bookingResources)) {
      this.registerResource(pattern, handler);
    }
    for (const [pattern, handler] of Object.entries(identityResources)) {
      this.registerResource(pattern, handler);
    }

    console.log(`✅ MCP Server initialized with ${this.tools.size} tools and ${this.resources.size} resources`);
  }

  async start(): Promise<void> {
    await this.initialize();

    if (this.config.transport === 'http') {
      // HTTP transport is handled externally (Express integration)
      console.log('🚀 MCP Server ready for HTTP transport');
    } else {
      // Default stdio transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('🚀 MCP Server running on stdio transport');
    }
  }

  getServer(): Server {
    return this.server;
  }
}

// Factory function for easy creation
export async function createMCPServer(config: MCPServerConfig): Promise<OpenStayMCPServer> {
  const server = new OpenStayMCPServer(config);
  await server.initialize();
  return server;
}

export default OpenStayMCPServer;

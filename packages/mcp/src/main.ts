/**
 * OpenStay MCP Package - Main exports
 */

export { OpenStayMCPServer, createMCPServer } from './index.js';
export { createMCPRouter, type MCPExpressConfig } from './utils/express.js';
export { registerPropertyTools, propertyResources } from './tools/property.js';
export { registerBookingTools, bookingResources } from './tools/booking.js';
export { registerSearchTools } from './tools/search.js';
export { registerIdentityTools, identityResources } from './tools/identity.js';

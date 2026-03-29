/**
 * Identity Tools - MCP tools for DID-based identity management
 */

import { z } from 'zod';
import type { OpenStayMCPServer, MCPServerConfig } from '../index.js';

// Validation schemas
const VerifyDIDSchema = z.object({
  did: z.string().regex(/^did:/).describe('DID to verify (e.g., did:abt:z1...)'),
  challenge: z.string().describe('Challenge string to verify'),
  signature: z.string().describe('Signature of the challenge'),
});

const GetUserProfileSchema = z.object({
  did: z.string().regex(/^did:/).describe('User DID'),
});

const GetUserBookingsSchema = z.object({
  did: z.string().regex(/^did:/).describe('User DID'),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded']).optional(),
  limit: z.number().int().min(1).max(50).default(20).describe('Maximum results'),
});

const RegisterTravelerSchema = z.object({
  did: z.string().regex(/^did:/).describe('Traveler DID'),
  email: z.string().email().optional().describe('Contact email'),
  phone: z.string().optional().describe('Contact phone'),
  preferences: z.object({
    currency: z.string().default('CNY').optional(),
    language: z.string().default('zh-CN').optional(),
    notifications: z.array(z.string()).default(['email']).optional(),
  }).optional().describe('Travel preferences'),
});

// Tool implementations
async function verifyDID(args: z.infer<typeof VerifyDIDSchema>, config: MCPServerConfig) {
  // In production, this would verify the signature against the DID document
  // For now, return a mock verification
  
  const isValid = args.did.startsWith('did:abt:') && args.signature.length > 10;
  
  return {
    verified: isValid,
    did: args.did,
    timestamp: new Date().toISOString(),
    // In production, return credentials associated with the DID
    credentials: isValid ? ['traveler:verified'] : [],
  };
}

async function getUserProfile(args: z.infer<typeof GetUserProfileSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Booking } = await importModels(sequelize);

  // Get user's booking statistics
  const bookings = await Booking.findAll({
    where: { guestDid: args.did },
  });

  const completedBookings = bookings.filter((b: any) => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum: number, b: any) => sum + Number(b.totalAmount), 0);

  return {
    did: args.did,
    profileType: 'traveler',
    verificationLevel: 'basic',
    statistics: {
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled').length,
      totalSpent,
      currency: bookings[0]?.currency || 'CNY',
    },
    memberSince: bookings.length > 0 
      ? new Date(Math.min(...bookings.map((b: any) => new Date(b.createdAt).getTime()))).toISOString()
      : null,
  };
}

async function getUserBookings(args: z.infer<typeof GetUserBookingsSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Booking, Room, Property } = await importModels(sequelize);

  const where: any = { guestDid: args.did };
  
  if (args.status) {
    where.status = args.status;
  }

  const bookings = await Booking.findAll({
    where,
    limit: args.limit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Room,
        as: 'room',
        attributes: ['name', 'type'],
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['name', 'city', 'country'],
          },
        ],
      },
    ],
  });

  return {
    did: args.did,
    count: bookings.length,
    bookings: bookings.map((b: any) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      status: b.status,
      dates: {
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
        nights: b.nights,
      },
      pricing: {
        totalAmount: b.totalAmount,
        currency: b.currency,
        paymentStatus: b.paymentStatus,
      },
      property: b.room?.property ? {
        name: b.room.property.name,
        location: {
          city: b.room.property.city,
          country: b.room.property.country,
        },
      } : null,
      room: b.room ? {
        name: b.room.name,
        type: b.room.type,
      } : null,
      createdAt: b.createdAt,
    })),
  };
}

async function registerTraveler(args: z.infer<typeof RegisterTravelerSchema>, config: MCPServerConfig) {
  // In production, this would create a user record in the database
  // and issue a verifiable credential
  
  return {
    success: true,
    did: args.did,
    registeredAt: new Date().toISOString(),
    preferences: args.preferences || {},
    message: 'Traveler registered successfully. You can now make bookings with your DID.',
  };
}

// Resource handlers
export const identityResources: Record<string, Function> = {
  'did://{did}/profile': async (params: { did: string }, config: MCPServerConfig) => {
    return getUserProfile({ did: params.did }, config);
  },
  
  'did://{did}/bookings': async (params: { did: string }, config: MCPServerConfig) => {
    return getUserBookings({ did: params.did, limit: 50 }, config);
  },
};

// Helper functions
async function importModels(sequelize: any) {
  return {
    Property: sequelize.models.Property,
    Room: sequelize.models.Room,
    Booking: sequelize.models.Booking,
    Calendar: sequelize.models.Calendar,
  };
}

function zodToJsonSchema(schema: z.ZodTypeAny): object {
  const def = (schema as any)._def;
  
  if (schema instanceof z.ZodObject) {
    const shape = def.shape();
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodTypeAny;
      properties[key] = zodToJsonSchema(zodValue);
      if (!(zodValue instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }
  
  if (schema instanceof z.ZodString) {
    const result: any = { type: 'string' };
    if (def.description) result.description = def.description;
    return result;
  }
  
  if (schema instanceof z.ZodNumber) {
    const result: any = { type: 'number' };
    if (def.description) result.description = def.description;
    return result;
  }
  
  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }
  
  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(def.type),
    };
  }
  
  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(def.innerType);
  }
  
  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(def.innerType);
    return { ...inner, default: def.defaultValue() };
  }
  
  if (schema instanceof z.ZodEnum) {
    return { type: 'string', enum: def.values };
  }
  
  return { type: 'object' };
}

// Register tools with the server
export function registerIdentityTools(server: OpenStayMCPServer): void {
  server.registerTool(
    'identity/verify',
    'Verify a DID signature for authentication',
    zodToJsonSchema(VerifyDIDSchema),
    verifyDID
  );

  server.registerTool(
    'identity/getProfile',
    'Get user profile and statistics by DID',
    zodToJsonSchema(GetUserProfileSchema),
    getUserProfile
  );

  server.registerTool(
    'identity/getBookings',
    'Get all bookings for a specific DID',
    zodToJsonSchema(GetUserBookingsSchema),
    getUserBookings
  );

  server.registerTool(
    'identity/registerTraveler',
    'Register a new traveler with their DID',
    zodToJsonSchema(RegisterTravelerSchema),
    registerTraveler
  );
}

/**
 * Property Tools - MCP tools for property management
 */

import { z } from 'zod';
import { Op } from 'sequelize';
import type { OpenStayMCPServer, MCPServerConfig } from '../index.js';

// Validation schemas
const SearchPropertiesSchema = z.object({
  city: z.string().optional().describe('City name to search in'),
  country: z.string().optional().describe('Country name to search in'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Check-in date (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Check-out date (YYYY-MM-DD)'),
  guests: z.number().int().min(1).max(50).optional().describe('Number of guests'),
  maxPrice: z.number().positive().optional().describe('Maximum price per night'),
  facilities: z.array(z.string()).optional().describe('Required facilities'),
  limit: z.number().int().min(1).max(100).default(20).describe('Maximum results to return'),
});

const GetPropertySchema = z.object({
  id: z.string().uuid().describe('Property ID'),
});

const CreatePropertySchema = z.object({
  name: z.string().min(1).max(255).describe('Property name'),
  description: z.string().optional().describe('Property description'),
  address: z.string().optional().describe('Street address'),
  city: z.string().optional().describe('City'),
  country: z.string().optional().describe('Country'),
  checkInTime: z.string().default('14:00').describe('Check-in time (HH:MM)'),
  checkOutTime: z.string().default('12:00').describe('Check-out time (HH:MM)'),
  facilities: z.array(z.string()).default([]).describe('List of facilities'),
});

const UpdatePropertySchema = z.object({
  id: z.string().uuid().describe('Property ID'),
  name: z.string().min(1).max(255).optional().describe('Property name'),
  description: z.string().optional().describe('Property description'),
  address: z.string().optional().describe('Street address'),
  city: z.string().optional().describe('City'),
  country: z.string().optional().describe('Country'),
  checkInTime: z.string().optional().describe('Check-in time (HH:MM)'),
  checkOutTime: z.string().optional().describe('Check-out time (HH:MM)'),
  facilities: z.array(z.string()).optional().describe('List of facilities'),
  status: z.enum(['active', 'inactive', 'suspended']).optional().describe('Property status'),
});

// Tool implementations
async function searchProperties(args: z.infer<typeof SearchPropertiesSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property } = await importModels(sequelize);

  const where: any = {
    status: 'active',
    isPublic: true,
  };

  if (args.city) where.city = { [Op.like]: `%${args.city}%` };
  if (args.country) where.country = args.country;

  // Build facilities filter
  if (args.facilities && args.facilities.length > 0) {
    where.facilities = { [Op.overlap]: args.facilities };
  }

  const properties = await Property.findAll({
    where,
    limit: args.limit,
    order: [['createdAt', 'DESC']],
    attributes: [
      'id', 'name', 'slug', 'description', 'city', 'country',
      'latitude', 'longitude', 'checkInTime', 'checkOutTime',
      'facilities', 'logoUrl', 'coverImageUrl', 'status',
    ],
  });

  return {
    count: properties.length,
    properties: properties.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      location: {
        city: p.city,
        country: p.country,
        latitude: p.latitude,
        longitude: p.longitude,
      },
      checkInTime: p.checkInTime,
      checkOutTime: p.checkOutTime,
      facilities: p.facilities,
      images: {
        logo: p.logoUrl,
        cover: p.coverImageUrl,
      },
      status: p.status,
    })),
  };
}

async function getProperty(args: z.infer<typeof GetPropertySchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property, Room } = await importModels(sequelize);

  const property = await Property.findByPk(args.id, {
    include: [{
      model: Room,
      as: 'rooms',
      required: false,
    }],
  });

  if (!property) {
    throw new Error(`Property not found: ${args.id}`);
  }

  return {
    id: property.id,
    name: property.name,
    slug: property.slug,
    description: property.description,
    location: {
      address: property.address,
      city: property.city,
      country: property.country,
      latitude: property.latitude,
      longitude: property.longitude,
    },
    contact: {
      phone: property.phone,
      email: property.email,
      website: property.website,
    },
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    facilities: property.facilities,
    languages: property.languages,
    images: {
      logo: property.logoUrl,
      cover: property.coverImageUrl,
    },
    status: property.status,
    isPublic: property.isPublic,
    rooms: (property as any).rooms?.map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      capacity: r.capacity,
      basePrice: r.basePrice,
    })),
  };
}

async function createProperty(args: z.infer<typeof CreatePropertySchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property } = await importModels(sequelize);

  // Generate slug from name
  const slug = args.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check for duplicate slug
  const existing = await Property.findOne({ where: { slug } });
  if (existing) {
    throw new Error(`Property with similar name already exists: ${slug}`);
  }

  const property = await Property.create({
    ...args,
    slug,
    did: `did:abt:temp-${Date.now()}`, // Should be replaced with actual DID
  });

  return {
    success: true,
    property: {
      id: property.id,
      name: property.name,
      slug: property.slug,
      status: property.status,
    },
  };
}

async function updateProperty(args: z.infer<typeof UpdatePropertySchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property } = await importModels(sequelize);
  const { id, ...updates } = args;

  const property = await Property.findByPk(id);
  if (!property) {
    throw new Error(`Property not found: ${id}`);
  }

  await property.update(updates);

  return {
    success: true,
    property: {
      id: property.id,
      name: property.name,
      status: property.status,
      updatedAt: property.updatedAt,
    },
  };
}

// Resource handlers
export const propertyResources: Record<string, Function> = {
  'property://{id}/details': async (params: { id: string }, config: MCPServerConfig) => {
    return getProperty({ id: params.id }, config);
  },
  
  'property://{id}/rooms': async (params: { id: string }, config: MCPServerConfig) => {
    const { sequelize } = config;
    const { Room } = await importModels(sequelize);
    
    const rooms = await Room.findAll({
      where: { propertyId: params.id },
    });
    
    return {
      propertyId: params.id,
      count: rooms.length,
      rooms: rooms.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        capacity: r.capacity,
        basePrice: r.basePrice,
        description: r.description,
      })),
    };
  },
};

// Helper to dynamically import models
async function importModels(sequelize: any) {
  // Return sequelize models directly since MCP is part of same workspace
  return {
    Property: sequelize.models.Property,
    Room: sequelize.models.Room,
    Booking: sequelize.models.Booking,
    Calendar: sequelize.models.Calendar,
  };
}

// Convert Zod schema to JSON Schema
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
export function registerPropertyTools(server: OpenStayMCPServer): void {
  server.registerTool(
    'property/search',
    'Search for available properties with filters like location, dates, guests, and facilities',
    zodToJsonSchema(SearchPropertiesSchema),
    searchProperties
  );

  server.registerTool(
    'property/get',
    'Get detailed information about a specific property including rooms and amenities',
    zodToJsonSchema(GetPropertySchema),
    getProperty
  );

  server.registerTool(
    'property/create',
    'Create a new property listing (host/operator only)',
    zodToJsonSchema(CreatePropertySchema),
    createProperty
  );

  server.registerTool(
    'property/update',
    'Update property information (host/operator only)',
    zodToJsonSchema(UpdatePropertySchema),
    updateProperty
  );
}

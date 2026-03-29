/**
 * Search Tools - MCP tools for advanced search and discovery
 */

import { z } from 'zod';
import { Op } from 'sequelize';
import type { OpenStayMCPServer, MCPServerConfig } from '../index.js';

// Validation schemas
const NaturalLanguageSearchSchema = z.object({
  query: z.string().min(1).describe('Natural language query (e.g., "beachfront villa in Bali for 2 people next weekend")'),
  limit: z.number().int().min(1).max(20).default(10).describe('Maximum results'),
});

const NearbySearchSchema = z.object({
  latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
  longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
  radius: z.number().positive().default(5000).describe('Search radius in meters'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Check-in date'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Check-out date'),
  guests: z.number().int().min(1).optional().describe('Number of guests'),
  limit: z.number().int().min(1).max(50).default(20).describe('Maximum results'),
});

const FilterFacilitiesSchema = z.object({
  facilities: z.array(z.string()).describe('Required facilities (e.g., ["wifi", "pool", "parking"])'),
  city: z.string().optional().describe('Filter by city'),
  limit: z.number().int().min(1).max(50).default(20).describe('Maximum results'),
});

const ComparePropertiesSchema = z.object({
  propertyIds: z.array(z.string().uuid()).min(2).max(5).describe('Property IDs to compare'),
});

// Tool implementations
async function naturalLanguageSearch(
  args: z.infer<typeof NaturalLanguageSearchSchema>,
  config: MCPServerConfig
) {
  const { sequelize } = config;
  const { Property } = await importModels(sequelize);

  // Parse natural language query for key terms
  const query = args.query.toLowerCase();
  
  // Extract potential location
  const facilityKeywords: Record<string, string[]> = {
    wifi: ['wifi', 'internet', 'wireless'],
    pool: ['pool', 'swimming'],
    parking: ['parking', 'garage'],
    breakfast: ['breakfast', 'morning meal'],
    gym: ['gym', 'fitness', 'workout'],
    spa: ['spa', 'wellness', 'massage'],
  };

  // Build facility filter
  const facilities: string[] = [];
  for (const [facility, keywords] of Object.entries(facilityKeywords)) {
    if (keywords.some(k => query.includes(k))) {
      facilities.push(facility);
    }
  }

  // Extract guest count
  const guestMatch = query.match(/(\d+)\s*(person|people|guest|guests)/);
  const guests = guestMatch ? parseInt(guestMatch[1]) : undefined;

  // Extract dates (simplified - in production, use date parser)
  const now = new Date();
  let checkIn: Date | undefined;
  let checkOut: Date | undefined;

  if (query.includes('next weekend')) {
    const day = now.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    checkIn = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
    checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000);
  } else if (query.includes('next week')) {
    checkIn = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    checkOut = new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000);
  }

  // Build query
  const where: any = {
    status: 'active',
    isPublic: true,
  };

  if (facilities.length > 0) {
    where.facilities = { [Op.overlap]: facilities };
  }

  // Try to match location
  const cities = await Property.findAll({
    attributes: ['city', 'country'],
    group: ['city', 'country'],
    raw: true,
  });

  for (const loc of cities as any[]) {
    if (loc.city && query.includes(loc.city.toLowerCase())) {
      where.city = loc.city;
      break;
    }
    if (loc.country && query.includes(loc.country.toLowerCase())) {
      where.country = loc.country;
      break;
    }
  }

  const properties = await Property.findAll({
    where,
    limit: args.limit,
    order: [['createdAt', 'DESC']],
  });

  return {
    parsedQuery: {
      extractedFacilities: facilities,
      extractedGuests: guests,
      extractedDates: checkIn ? {
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut?.toISOString().split('T')[0],
      } : null,
    },
    count: properties.length,
    properties: properties.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      location: {
        city: p.city,
        country: p.country,
      },
      facilities: p.facilities,
      coverImageUrl: p.coverImageUrl,
    })),
  };
}

async function nearbySearch(args: z.infer<typeof NearbySearchSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property } = await importModels(sequelize);

  // Calculate bounding box (simplified - doesn't account for curvature)
  const latRadius = args.radius / 111000; // ~111km per degree
  const lngRadius = args.radius / (111000 * Math.cos(args.latitude * Math.PI / 180));

  const properties = await Property.findAll({
    where: {
      status: 'active',
      isPublic: true,
      latitude: {
        [Op.between]: [args.latitude - latRadius, args.latitude + latRadius],
      },
      longitude: {
        [Op.between]: [args.longitude - lngRadius, args.longitude + lngRadius],
      },
    },
    limit: args.limit,
  });

  // Calculate actual distances and sort
  const results = properties.map((p: any) => {
    const distance = calculateDistance(
      args.latitude,
      args.longitude,
      p.latitude,
      p.longitude
    );
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      location: {
        city: p.city,
        country: p.country,
        latitude: p.latitude,
        longitude: p.longitude,
      },
      distance: Math.round(distance),
      distanceUnit: 'meters',
      facilities: p.facilities,
      coverImageUrl: p.coverImageUrl,
    };
  }).filter((p: any) => p.distance <= args.radius)
    .sort((a: any, b: any) => a.distance - b.distance);

  return {
    searchCenter: {
      latitude: args.latitude,
      longitude: args.longitude,
    },
    radius: args.radius,
    count: results.length,
    properties: results,
  };
}

async function filterByFacilities(args: z.infer<typeof FilterFacilitiesSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property } = await importModels(sequelize);

  const where: any = {
    status: 'active',
    isPublic: true,
    facilities: { [Op.contains]: args.facilities },
  };

  if (args.city) {
    where.city = { [Op.like]: `%${args.city}%` };
  }

  const properties = await Property.findAll({
    where,
    limit: args.limit,
    order: [['createdAt', 'DESC']],
  });

  return {
    requiredFacilities: args.facilities,
    count: properties.length,
    properties: properties.map((p: any) => ({
      id: p.id,
      name: p.name,
      location: {
        city: p.city,
        country: p.country,
      },
      facilities: p.facilities,
      matchingFacilities: args.facilities.filter((f: string) => p.facilities.includes(f)),
      coverImageUrl: p.coverImageUrl,
    })),
  };
}

async function compareProperties(args: z.infer<typeof ComparePropertiesSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Property, Room, Booking } = await importModels(sequelize);

  const properties = await Property.findAll({
    where: {
      id: { [Op.in]: args.propertyIds },
    },
    include: [
      {
        model: Room,
        as: 'rooms',
      },
    ],
  });

  if (properties.length !== args.propertyIds.length) {
    const found = properties.map((p: any) => p.id);
    const missing = args.propertyIds.filter(id => !found.includes(id));
    throw new Error(`Properties not found: ${missing.join(', ')}`);
  }

  // Get booking statistics
  const stats = await Promise.all(
    properties.map(async (p: any) => {
      const bookings = await Booking.count({
        where: {
          propertyId: p.id,
          status: 'completed',
        },
      });
      return { propertyId: p.id, completedBookings: bookings };
    })
  );

  const comparison = properties.map((p: any) => {
    const stat = stats.find((s: any) => s.propertyId === p.id);
    const rooms = p.rooms || [];
    const minPrice = rooms.length > 0 
      ? Math.min(...rooms.map((r: any) => Number(r.basePrice)))
      : null;
    const maxPrice = rooms.length > 0
      ? Math.max(...rooms.map((r: any) => Number(r.basePrice)))
      : null;

    return {
      id: p.id,
      name: p.name,
      location: {
        city: p.city,
        country: p.country,
      },
      facilities: p.facilities,
      rooms: {
        count: rooms.length,
        minPrice,
        maxPrice,
        currency: rooms[0]?.currency || 'CNY',
      },
      statistics: {
        completedBookings: stat?.completedBookings || 0,
      },
    };
  });

  return {
    comparedProperties: comparison,
    summary: {
      totalCompared: comparison.length,
      priceRange: {
        min: Math.min(...comparison.map((c: any) => c.rooms.minPrice).filter(Boolean)),
        max: Math.max(...comparison.map((c: any) => c.rooms.maxPrice).filter(Boolean)),
      },
      commonFacilities: args.propertyIds.length > 0
        ? comparison.reduce((acc: string[], curr: any) => {
            if (acc.length === 0) return curr.facilities;
            return acc.filter((f: string) => curr.facilities.includes(f));
          }, [])
        : [],
    },
  };
}

// Helper functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
export function registerSearchTools(server: OpenStayMCPServer): void {
  server.registerTool(
    'search/natural',
    'Search properties using natural language query',
    zodToJsonSchema(NaturalLanguageSearchSchema),
    naturalLanguageSearch
  );

  server.registerTool(
    'search/nearby',
    'Find properties near specific coordinates (latitude/longitude)',
    zodToJsonSchema(NearbySearchSchema),
    nearbySearch
  );

  server.registerTool(
    'search/filterFacilities',
    'Filter properties by required facilities',
    zodToJsonSchema(FilterFacilitiesSchema),
    filterByFacilities
  );

  server.registerTool(
    'search/compare',
    'Compare multiple properties side by side',
    zodToJsonSchema(ComparePropertiesSchema),
    compareProperties
  );
}

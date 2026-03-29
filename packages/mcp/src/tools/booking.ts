/**
 * Booking Tools - MCP tools for booking management
 */

import { z } from 'zod';
import { Op } from 'sequelize';
import type { OpenStayMCPServer, MCPServerConfig } from '../index.js';

// Validation schemas
const CreateBookingSchema = z.object({
  roomId: z.string().uuid().describe('Room ID to book'),
  propertyId: z.string().uuid().describe('Property ID'),
  guestName: z.string().min(1).describe('Guest full name'),
  guestEmail: z.string().email().describe('Guest email address'),
  guestPhone: z.string().optional().describe('Guest phone number'),
  guestCount: z.number().int().min(1).default(1).describe('Number of guests'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Check-in date (YYYY-MM-DD)'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Check-out date (YYYY-MM-DD)'),
  specialRequests: z.string().optional().describe('Special requests or notes'),
});

const GetBookingSchema = z.object({
  id: z.string().uuid().describe('Booking ID'),
});

const GetBookingByNumberSchema = z.object({
  bookingNumber: z.string().describe('Booking number (e.g., OST-2024-0001)'),
});

const UpdateBookingStatusSchema = z.object({
  id: z.string().uuid().describe('Booking ID'),
  status: z.enum(['confirmed', 'checked_in', 'completed', 'cancelled']).describe('New status'),
});

const ListBookingsSchema = z.object({
  propertyId: z.string().uuid().optional().describe('Filter by property ID'),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded']).optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Filter from date'),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Filter to date'),
  limit: z.number().int().min(1).max(100).default(20).describe('Maximum results'),
});

const CheckAvailabilitySchema = z.object({
  roomId: z.string().uuid().describe('Room ID'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Check-in date (YYYY-MM-DD)'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Check-out date (YYYY-MM-DD)'),
});

// Tool implementations
async function createBooking(args: z.infer<typeof CreateBookingSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Booking, Room, Property } = await importModels(sequelize);

  // Validate room exists
  const room = await Room.findByPk(args.roomId, {
    include: [{ model: Property, as: 'property' }],
  });
  
  if (!room) {
    throw new Error(`Room not found: ${args.roomId}`);
  }

  // Check availability
  const checkIn = new Date(args.checkInDate);
  const checkOut = new Date(args.checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    throw new Error('Check-out date must be after check-in date');
  }

  const existingBooking = await Booking.findOne({
    where: {
      roomId: args.roomId,
      status: { [Op.notIn]: ['cancelled', 'refunded'] },
      [Op.or]: [
        {
          checkInDate: { [Op.lte]: args.checkInDate },
          checkOutDate: { [Op.gt]: args.checkInDate },
        },
        {
          checkInDate: { [Op.lt]: args.checkOutDate },
          checkOutDate: { [Op.gte]: args.checkOutDate },
        },
      ],
    },
  });

  if (existingBooking) {
    throw new Error('Room is not available for the selected dates');
  }

  // Generate booking number
  const today = new Date();
  const year = today.getFullYear();
  const count = await Booking.count({
    where: sequelize.where(
      sequelize.fn('YEAR', sequelize.col('createdAt')),
      year
    ),
  });
  const bookingNumber = `OST-${year}-${String(count + 1).padStart(4, '0')}`;

  // Calculate pricing
  const roomPrice = (room as any).basePrice;
  const taxes = Number(roomPrice) * nights * 0.1; // 10% tax
  const totalAmount = Number(roomPrice) * nights + taxes;

  // Create booking
  const booking = await Booking.create({
    ...args,
    bookingNumber,
    nights,
    roomPrice,
    taxes,
    totalAmount,
    currency: (room as any).property?.currency || 'CNY',
    status: 'pending',
    paymentStatus: 'pending',
  });

  return {
    success: true,
    booking: {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights: booking.nights,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      paymentStatus: booking.paymentStatus,
    },
  };
}

async function getBooking(args: z.infer<typeof GetBookingSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Booking, Room, Property } = await importModels(sequelize);

  const booking = await Booking.findByPk(args.id, {
    include: [
      {
        model: Room,
        as: 'room',
        include: [{ model: Property, as: 'property' }],
      },
    ],
  });

  if (!booking) {
    throw new Error(`Booking not found: ${args.id}`);
  }

  return formatBookingResponse(booking);
}

async function getBookingByNumber(
  args: z.infer<typeof GetBookingByNumberSchema>,
  config: MCPServerConfig
) {
  const { sequelize } = config;
  const { Booking, Room, Property } = await importModels(sequelize);

  const booking = await Booking.findOne({
    where: { bookingNumber: args.bookingNumber },
    include: [
      {
        model: Room,
        as: 'room',
        include: [{ model: Property, as: 'property' }],
      },
    ],
  });

  if (!booking) {
    throw new Error(`Booking not found: ${args.bookingNumber}`);
  }

  return formatBookingResponse(booking);
}

async function updateBookingStatus(
  args: z.infer<typeof UpdateBookingStatusSchema>,
  config: MCPServerConfig
) {
  const { sequelize } = config;
  const { Booking } = await importModels(sequelize);

  const booking = await Booking.findByPk(args.id);
  if (!booking) {
    throw new Error(`Booking not found: ${args.id}`);
  }

  const updateData: any = { status: args.status };
  
  // Set timestamps based on status
  switch (args.status) {
    case 'confirmed':
      updateData.confirmedAt = new Date();
      break;
    case 'checked_in':
      updateData.checkedInAt = new Date();
      break;
    case 'completed':
      updateData.completedAt = new Date();
      break;
    case 'cancelled':
      updateData.cancelledAt = new Date();
      updateData.paymentStatus = 'refunded';
      break;
  }

  await booking.update(updateData);

  return {
    success: true,
    booking: {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      updatedAt: booking.updatedAt,
    },
  };
}

async function listBookings(args: z.infer<typeof ListBookingsSchema>, config: MCPServerConfig) {
  const { sequelize } = config;
  const { Booking, Room } = await importModels(sequelize);

  const where: any = {};
  
  if (args.propertyId) {
    where.propertyId = args.propertyId;
  }
  
  if (args.status) {
    where.status = args.status;
  }
  
  if (args.fromDate || args.toDate) {
    where.checkInDate = {};
    if (args.fromDate) where.checkInDate[Op.gte] = args.fromDate;
    if (args.toDate) where.checkInDate[Op.lte] = args.toDate;
  }

  const bookings = await Booking.findAll({
    where,
    limit: args.limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Room, as: 'room', attributes: ['name', 'type'] }],
  });

  return {
    count: bookings.length,
    bookings: bookings.map((b: any) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      nights: b.nights,
      totalAmount: b.totalAmount,
      currency: b.currency,
      status: b.status,
      paymentStatus: b.paymentStatus,
      room: b.room ? {
        name: b.room.name,
        type: b.room.type,
      } : null,
    })),
  };
}

async function checkAvailability(
  args: z.infer<typeof CheckAvailabilitySchema>,
  config: MCPServerConfig
) {
  const { sequelize } = config;
  const { Booking, Room } = await importModels(sequelize);

  const room = await Room.findByPk(args.roomId);
  if (!room) {
    throw new Error(`Room not found: ${args.roomId}`);
  }

  const checkIn = new Date(args.checkInDate);
  const checkOut = new Date(args.checkOutDate);

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }

  const existingBooking = await Booking.findOne({
    where: {
      roomId: args.roomId,
      status: { [Op.notIn]: ['cancelled', 'refunded'] },
      [Op.or]: [
        {
          checkInDate: { [Op.lte]: args.checkInDate },
          checkOutDate: { [Op.gt]: args.checkInDate },
        },
        {
          checkInDate: { [Op.lt]: args.checkOutDate },
          checkOutDate: { [Op.gte]: args.checkOutDate },
        },
      ],
    },
  });

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = Number((room as any).basePrice);
  const taxes = basePrice * nights * 0.1;
  const totalAmount = basePrice * nights + taxes;

  return {
    available: !existingBooking,
    roomId: args.roomId,
    checkInDate: args.checkInDate,
    checkOutDate: args.checkOutDate,
    nights,
    pricing: {
      basePrice,
      nights,
      subtotal: basePrice * nights,
      taxes,
      totalAmount,
      currency: (room as any).currency || 'CNY',
    },
  };
}

// Resource handlers
export const bookingResources: Record<string, Function> = {
  'booking://{id}': async (params: { id: string }, config: MCPServerConfig) => {
    return getBooking({ id: params.id }, config);
  },
  
  'booking://number/{bookingNumber}': async (
    params: { bookingNumber: string },
    config: MCPServerConfig
  ) => {
    return getBookingByNumber({ bookingNumber: params.bookingNumber }, config);
  },
  
  'property://{propertyId}/bookings': async (
    params: { propertyId: string },
    config: MCPServerConfig
  ) => {
    return listBookings({ propertyId: params.propertyId, limit: 50 }, config);
  },
};

// Helper functions
function formatBookingResponse(booking: any) {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    guest: {
      name: booking.guestName,
      email: booking.guestEmail,
      phone: booking.guestPhone,
      count: booking.guestCount,
    },
    dates: {
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      nights: booking.nights,
    },
    room: booking.room ? {
      id: booking.room.id,
      name: booking.room.name,
      type: booking.room.type,
      property: booking.room.property ? {
        id: booking.room.property.id,
        name: booking.room.property.name,
      } : null,
    } : null,
    pricing: {
      roomPrice: booking.roomPrice,
      taxes: booking.taxes,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
    },
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    specialRequests: booking.specialRequests,
    createdAt: booking.createdAt,
  };
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
export function registerBookingTools(server: OpenStayMCPServer): void {
  server.registerTool(
    'booking/create',
    'Create a new booking reservation',
    zodToJsonSchema(CreateBookingSchema),
    createBooking
  );

  server.registerTool(
    'booking/get',
    'Get booking details by ID',
    zodToJsonSchema(GetBookingSchema),
    getBooking
  );

  server.registerTool(
    'booking/getByNumber',
    'Get booking details by booking number',
    zodToJsonSchema(GetBookingByNumberSchema),
    getBookingByNumber
  );

  server.registerTool(
    'booking/updateStatus',
    'Update booking status (confirmed, checked_in, completed, cancelled)',
    zodToJsonSchema(UpdateBookingStatusSchema),
    updateBookingStatus
  );

  server.registerTool(
    'booking/list',
    'List bookings with filters',
    zodToJsonSchema(ListBookingsSchema),
    listBookings
  );

  server.registerTool(
    'booking/checkAvailability',
    'Check room availability for specific dates',
    zodToJsonSchema(CheckAvailabilitySchema),
    checkAvailability
  );
}

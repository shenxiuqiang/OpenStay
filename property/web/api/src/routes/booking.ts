/* eslint-disable consistent-return */
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Booking from '../models/booking.js';
import Calendar from '../models/calendar.js';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array(),
      },
    });
  }
  next();
};

// Generate booking number
function generateBookingNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `B${date}-${random}`;
}

// Get all bookings for a property
router.get(
  '/',
  [query('propertyId').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const { propertyId, status, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = { propertyId };
      if (status) {
        where.status = status;
      }

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset,
      });

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            total: count,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            totalPages: Math.ceil(count / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single booking
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// Create booking
router.post(
  '/',
  [
    body('propertyId').isUUID(),
    body('roomId').isUUID(),
    body('guestName').isString().notEmpty(),
    body('guestEmail').isEmail(),
    body('checkInDate').isISO8601(),
    body('checkOutDate').isISO8601(),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { roomId, checkInDate, checkOutDate } = req.body;

      // Check room availability
      const nights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if dates are available
      const unavailableDates = await Calendar.findAll({
        where: {
          roomId,
          date: {
            $gte: checkInDate,
            $lt: checkOutDate,
          },
          $or: [
            { status: 'booked' },
            { status: 'blocked' },
            { status: 'maintenance' },
            { availableCount: 0 },
          ],
        } as any,
      });

      if (unavailableDates.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'NOT_AVAILABLE',
            message: 'Selected dates are not available',
          },
        });
      }

      // Calculate price (simplified - should use calendar prices)
      const { roomPrice = 0, taxes = 0 } = req.body;
      const totalAmount = parseFloat(roomPrice) * nights + parseFloat(taxes);

      const booking = await Booking.create({
        id: uuidv4(),
        bookingNumber: generateBookingNumber(),
        nights,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        source: 'direct',
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update calendar (mark dates as booked)
      await Calendar.update(
        { status: 'booked', availableCount: 0 },
        {
          where: {
            roomId,
            date: {
              $gte: checkInDate,
              $lt: checkOutDate,
            },
          },
        } as any
      );

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update booking status
router.patch(
  '/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['confirmed', 'checked_in', 'completed', 'cancelled']),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const booking = await Booking.findByPk(req.params.id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found',
          },
        });
      }

      const { status } = req.body;
      const updateData: any = { status, updatedAt: new Date() };

      // Set timestamp based on status
      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      } else if (status === 'checked_in') {
        updateData.checkedInAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
        updateData.paymentStatus = 'refunded';

        // Free up calendar
        await Calendar.update(
          { status: 'available', availableCount: 1 },
          {
            where: {
              roomId: booking.roomId,
              date: {
                $gte: booking.checkInDate,
                $lt: booking.checkOutDate,
              },
            },
          } as any
        );
      }

      await booking.update(updateData);

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

/* eslint-disable consistent-return */
import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import Property from '../models/property.js';
import Room from '../models/room.js';

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

// Get public property info (for Hub sync)
router.get('/property/:id', async (req, res, next) => {
  try {
    const property = await Property.findOne({
      where: {
        id: req.params.id,
        status: 'active',
        isPublic: true,
      },
      attributes: {
        exclude: ['customCss', 'createdAt', 'updatedAt'],
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Property not found or not public',
        },
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

// Get public rooms (for Hub sync)
router.get(
  '/rooms',
  [query('propertyId').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const rooms = await Room.findAll({
        where: {
          propertyId: req.query.propertyId,
          status: 'active',
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        order: [['sortOrder', 'ASC']],
      });

      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }
);

// NHSP Sync endpoint (Node Hub Synchronization Protocol)
router.get(
  '/sync',
  [query('propertyId').isUUID(), query('cursor').optional(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const { propertyId, cursor } = req.query;
      
      // For MVP, return all active rooms
      // In production, this would use cursor-based pagination
      const rooms = await Room.findAll({
        where: {
          propertyId,
          status: 'active',
        },
        order: [['updatedAt', 'DESC']],
      });

      const property = await Property.findOne({
        where: {
          id: propertyId,
          status: 'active',
          isPublic: true,
        },
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found or not public',
          },
        });
      }

      res.json({
        success: true,
        data: {
          cursor: new Date().toISOString(), // Next cursor
          hasMore: false,
          property: {
            id: property.id,
            name: property.name,
            slug: property.slug,
            description: property.description,
            city: property.city,
            country: property.country,
            latitude: property.latitude,
            longitude: property.longitude,
            facilities: property.facilities,
            coverImageUrl: property.coverImageUrl,
          },
          rooms: rooms.map(room => ({
            id: room.id,
            name: room.name,
            description: room.description,
            area: room.area,
            bedType: room.bedType,
            maxGuests: room.maxGuests,
            amenities: room.amenities,
            basePrice: room.basePrice,
            currency: room.currency,
            coverImageUrl: room.coverImageUrl,
            imageUrls: room.imageUrls,
            minNights: room.minNights,
            maxNights: room.maxNights,
            cancellationPolicy: room.cancellationPolicy,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

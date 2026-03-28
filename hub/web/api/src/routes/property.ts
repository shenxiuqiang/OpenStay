/* eslint-disable consistent-return */
import { Router } from 'express';
import { query, param, validationResult } from 'express-validator';
import IndexedProperty from '../models/indexed-property.js';

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

// Search properties
router.get(
  '/',
  [
    query('city').optional().isString(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('guests').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const {
        city,
        country,
        minPrice,
        maxPrice,
        guests,
        facilities,
        page = '1',
        limit = '20',
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build where clause
      const where: any = {
        syncStatus: 'synced',
      };

      if (city) {
        where.city = city;
      }

      if (country) {
        where.country = country;
      }

      if (minPrice || maxPrice) {
        where.minPrice = {};
        if (minPrice) {
          where.minPrice.$gte = parseFloat(minPrice as string);
        }
        if (maxPrice) {
          where.maxPrice.$lte = parseFloat(maxPrice as string);
        }
      }

      // Execute query
      const { count, rows: properties } = await IndexedProperty.findAndCountAll({
        where,
        order: [
          ['isFeatured', 'DESC'],
          ['viewCount', 'DESC'],
        ],
        limit: parseInt(limit as string),
        offset,
      });

      // Increment view count (fire and forget)
      const propertyIds = properties.map((p) => p.id);
      IndexedProperty.increment('viewCount', {
        where: { id: propertyIds },
      }).catch(console.error);

      res.json({
        success: true,
        data: {
          properties,
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

// Get single property
router.get('/:id', async (req, res, next) => {
  try {
    const property = await IndexedProperty.findOne({
      where: {
        propertyId: req.params.id,
        syncStatus: 'synced',
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Property not found',
        },
      });
    }

    // Increment click count
    await property.increment('clickCount');

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

// Get all properties with coordinates for map view
router.get('/all/coords', async (_req, res, next) => {
  try {
    const properties = await IndexedProperty.findAll({
      attributes: [
        'id',
        'propertyId',
        'name',
        'city',
        'country',
        'minPrice',
        'maxPrice',
        'latitude',
        'longitude',
        'propertyType',
        'syncStatus',
        'thumbnail',
      ],
      where: {
        latitude: { $ne: null },
        longitude: { $ne: null },
      },
    });

    const mapped = properties.map((p) => ({
      id: p.propertyId,
      name: p.name,
      city: p.city,
      country: p.country,
      price: p.minPrice,
      latitude: p.latitude,
      longitude: p.longitude,
      type: p.tier || 'basic',
      status: p.syncStatus === 'synced' ? 'active' : 'pending',
      image: p.coverImageUrl,
    }));

    res.json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    next(error);
  }
});
router.get('/featured/list', async (_req, res, next) => {
  try {
    const properties = await IndexedProperty.findAll({
      where: {
        isFeatured: true,
        syncStatus: 'synced',
      },
      order: [['viewCount', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

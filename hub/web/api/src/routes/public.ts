/* eslint-disable consistent-return */
import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import IndexedProperty from '../models/indexed-property.js';
import Hub from '../models/hub.js';

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

// Get hub info (public)
router.get('/hub', async (_req, res, next) => {
  try {
    const hub = await Hub.findOne({
      where: { status: 'active' },
      attributes: [
        'id', 'name', 'slug', 'description', 'region', 'category',
        'languages', 'logoUrl', 'coverImageUrl', 'propertyCount',
      ],
    });

    if (!hub) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hub not found',
        },
      });
    }

    res.json({
      success: true,
      data: hub,
    });
  } catch (error) {
    next(error);
  }
});

// Search properties (public)
router.get(
  '/properties',
  [
    query('city').optional().isString(),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const {
        city,
        country,
        minPrice,
        maxPrice,
        page = '1',
        limit = '20',
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {
        syncStatus: 'synced',
      };

      if (city) {
        where.city = city;
      }

      if (country) {
        where.country = country;
      }

      if (minPrice) {
        where.maxPrice = { $gte: parseFloat(minPrice as string) };
      }

      if (maxPrice) {
        where.minPrice = { $lte: parseFloat(maxPrice as string) };
      }

      const { count, rows: properties } = await IndexedProperty.findAndCountAll({
        where,
        attributes: [
          'id', 'propertyId', 'name', 'description', 'city', 'country',
          'coverImageUrl', 'facilities', 'minPrice', 'maxPrice', 'currency',
          'tier', 'hubTags', 'isFeatured',
        ],
        order: [
          ['isFeatured', 'DESC'],
          ['viewCount', 'DESC'],
        ],
        limit: parseInt(limit as string),
        offset,
      });

      res.json({
        success: true,
        data: {
          properties: properties.map((p) => ({
            ...p.toJSON(),
            endpoint: undefined, // Hide endpoint from public
          })),
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

// Get property detail with redirect URL
router.get('/properties/:id', async (req, res, next) => {
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
      data: {
        id: property.id,
        propertyId: property.propertyId,
        name: property.name,
        description: property.description,
        city: property.city,
        country: property.country,
        latitude: property.latitude,
        longitude: property.longitude,
        coverImageUrl: property.coverImageUrl,
        facilities: property.facilities,
        minPrice: property.minPrice,
        maxPrice: property.maxPrice,
        currency: property.currency,
        tier: property.tier,
        hubTags: property.hubTags,
        isFeatured: property.isFeatured,
        directUrl: `${property.propertyEndpoint}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

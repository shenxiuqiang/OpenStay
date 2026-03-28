/* eslint-disable consistent-return */
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Property from '../models/property.js';

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

// Get property info
router.get('/', async (_req, res, next) => {
  try {
    // For MVP, get the first active property
    // In production, this would be based on DID auth
    const property = await Property.findOne({
      where: { status: 'active' },
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

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
});

// Create property
router.post(
  '/',
  [
    body('did').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('slug').isString().notEmpty(),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const existing = await Property.findOne({
        where: {
          $or: [
            { did: req.body.did },
            { slug: req.body.slug },
          ],
        } as any,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Property with this DID or slug already exists',
          },
        });
      }

      const property = await Property.create({
        id: uuidv4(),
        ...req.body,
        status: 'active',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update property
router.patch(
  '/:id',
  [param('id').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const property = await Property.findByPk(req.params.id);
      if (!property) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      await property.update({
        ...req.body,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

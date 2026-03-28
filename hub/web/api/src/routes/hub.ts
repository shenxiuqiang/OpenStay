/* eslint-disable consistent-return */
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
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

// Get hub info
router.get('/', async (_req, res, next) => {
  try {
    const hub = await Hub.findOne({
      where: { status: 'active' },
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

// Create hub
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
      const existing = await Hub.findOne({
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
            message: 'Hub with this DID or slug already exists',
          },
        });
      }

      const hub = await Hub.create({
        id: uuidv4(),
        ...req.body,
        status: 'active',
        propertyCount: 0,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: hub,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update hub
router.patch(
  '/:id',
  [param('id').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const hub = await Hub.findByPk(req.params.id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Hub not found',
          },
        });
      }

      await hub.update({
        ...req.body,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        data: hub,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get hub stats
router.get('/stats', async (_req, res, next) => {
  try {
    const hub = await Hub.findOne({
      where: { status: 'active' },
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
      data: {
        propertyCount: hub.propertyCount,
        totalBookings: hub.totalBookings,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

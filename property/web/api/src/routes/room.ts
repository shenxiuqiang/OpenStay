/* eslint-disable consistent-return */
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
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

// Get all rooms for a property
router.get(
  '/',
  [query('propertyId').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const rooms = await Room.findAll({
        where: {
          propertyId: req.query.propertyId,
          status: 'active',
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

// Get single room
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Room not found',
        },
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
});

// Create room
router.post(
  '/',
  [
    body('propertyId').isUUID(),
    body('name').isString().notEmpty(),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const room = await Room.create({
        id: uuidv4(),
        ...req.body,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update room
router.patch(
  '/:id',
  [param('id').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const room = await Room.findByPk(req.params.id);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Room not found',
          },
        });
      }

      await room.update({
        ...req.body,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete room
router.delete(
  '/:id',
  [param('id').isUUID(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const room = await Room.findByPk(req.params.id);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Room not found',
          },
        });
      }

      await room.update({
        status: 'inactive',
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        data: { message: 'Room deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

/* eslint-disable consistent-return */
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import JoinRequest from '../models/join-request.js';
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

// Get all join requests
router.get(
  '/',
  [query('status').optional().isIn(['pending', 'under_review', 'approved', 'rejected'])],
  async (req, res, next) => {
    try {
      const where: any = {};
      if (req.query.status) {
        where.status = req.query.status;
      }

      const requests = await JoinRequest.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single join request
router.get('/:id', async (req, res, next) => {
  try {
    const request = await JoinRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Join request not found',
        },
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
});

// Create join request (Property applies to join)
router.post(
  '/',
  [
    body('propertyId').isString().notEmpty(),
    body('propertyDid').isString().notEmpty(),
    body('propertyEndpoint').isURL(),
    body('propertyName').isString().notEmpty(),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      // Get the hub
      const hub = await Hub.findOne({ where: { status: 'active' } });
      if (!hub) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'HUB_NOT_FOUND',
            message: 'No active hub found',
          },
        });
      }

      // Check if already exists
      const existing = await JoinRequest.findOne({
        where: {
          hubId: hub.id,
          propertyId: req.body.propertyId,
          status: ['pending', 'under_review', 'approved'],
        } as any,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Join request already exists for this property',
          },
        });
      }

      const request = await JoinRequest.create({
        id: uuidv4(),
        hubId: hub.id,
        ...req.body,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Review join request
router.post(
  '/:id/review',
  [
    param('id').isUUID(),
    body('action').isIn(['approve', 'reject']),
    body('tier').optional().isIn(['basic', 'pro', 'premium']),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const request = await JoinRequest.findByPk(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Join request not found',
          },
        });
      }

      if (request.status !== 'pending' && request.status !== 'under_review') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Request has already been reviewed',
          },
        });
      }

      const { action, tier = 'basic', reviewNotes } = req.body;
      const reviewerDid = req.body.reviewerDid || 'system';

      if (action === 'approve') {
        // Update request status
        await request.update({
          status: 'approved',
          reviewedBy: reviewerDid,
          reviewNotes,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        });

        // Create indexed property
        await IndexedProperty.create({
          id: uuidv4(),
          hubId: request.hubId,
          propertyId: request.propertyId,
          propertyDid: request.propertyDid,
          propertyEndpoint: request.propertyEndpoint,
          name: request.propertyName,
          tier,
          syncStatus: 'syncing',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Update hub property count
        await Hub.increment('propertyCount', { where: { id: request.hubId } });
      } else {
        await request.update({
          status: 'rejected',
          reviewedBy: reviewerDid,
          reviewNotes,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        });
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

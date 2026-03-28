/* eslint-disable consistent-return */
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import IndexedProperty from '../models/indexed-property.js';
import SyncClient from '../libs/sync-client.js';

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

// Trigger sync for a property
router.post(
  '/trigger/:propertyId',
  [param('propertyId').isString(), handleValidationErrors],
  async (req, res, next) => {
    try {
      const { propertyId } = req.params;

      const indexedProperty = await IndexedProperty.findOne({
        where: { propertyId },
      });

      if (!indexedProperty) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Indexed property not found',
          },
        });
      }

      // Update sync status
      await indexedProperty.update({
        syncStatus: 'syncing',
        updatedAt: new Date(),
      });

      // Perform sync in background
      syncProperty(indexedProperty).catch(console.error);

      res.json({
        success: true,
        data: {
          message: 'Sync triggered',
          propertyId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Sync all properties
router.post('/all', async (_req, res, next) => {
  try {
    const properties = await IndexedProperty.findAll({
      where: { syncStatus: ['synced', 'error'] as any },
    });

    // Trigger sync for all properties
    for (const property of properties) {
      property.update({ syncStatus: 'syncing' }).catch(console.error);
      syncProperty(property).catch(console.error);
    }

    res.json({
      success: true,
      data: {
        message: `Triggered sync for ${properties.length} properties`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get sync status
router.get('/status/:propertyId', async (req, res, next) => {
  try {
    const property = await IndexedProperty.findOne({
      where: { propertyId: req.params.propertyId },
      attributes: ['id', 'propertyId', 'syncStatus', 'lastSyncAt', 'syncCursor'],
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

// Background sync function
async function syncProperty(indexedProperty: IndexedProperty) {
  try {
    const client = new SyncClient(indexedProperty.propertyEndpoint);
    const data = await client.sync(indexedProperty.syncCursor || undefined);

    // Calculate min/max prices from rooms
    const prices = data.rooms.map((r) => r.basePrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Update indexed property
    await indexedProperty.update({
      name: data.property.name,
      description: data.property.description,
      city: data.property.city,
      country: data.property.country,
      latitude: data.property.latitude,
      longitude: data.property.longitude,
      coverImageUrl: data.property.coverImageUrl,
      facilities: data.property.facilities,
      minPrice,
      maxPrice,
      syncStatus: 'synced',
      lastSyncAt: new Date(),
      syncCursor: data.cursor,
    });

    console.log(`✅ Synced property: ${data.property.name}`);
  } catch (error) {
    console.error(`❌ Failed to sync property ${indexedProperty.propertyId}:`, error);
    await indexedProperty.update({
      syncStatus: 'error',
      updatedAt: new Date(),
    });
  }
}

export default router;

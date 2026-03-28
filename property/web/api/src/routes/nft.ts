/* eslint-disable consistent-return */
import { Router } from 'express';
import type { Request, Response } from 'express';

import { nftService } from '../services/nft/nft.service.js';

const router = Router();

// GET /api/nft/stake-requirements - 获取质押要求
router.get('/nft/stake-requirements', (req: Request, res: Response) => {
  try {
    const requirements = nftService.getStakeRequirements();
    return res.json({
      success: true,
      data: { requirements },
    });
  } catch (error) {
    console.error('[NFT API] Failed to get stake requirements', error);
    return res.status(500).json({
      success: false,
      error: { code: 'GET_REQUIREMENTS_FAILED', message: 'Failed to get stake requirements' },
    });
  }
});

// POST /api/nft/node/mint - 铸造节点 NFT（质押）
router.post('/nft/node/mint', async (req: Request, res: Response) => {
  try {
    const { name, endpoint, region, stake, capacity, owner, pk } = req.body;

    if (!name || !endpoint || !region || !stake || !capacity || !owner || !pk) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'Missing required fields' },
      });
    }

    const asset = await nftService.mintNodeNFT({
      name,
      endpoint,
      region,
      stake,
      capacity,
      owner,
      pk,
    });

    return res.status(201).json({
      success: true,
      data: { asset, message: 'Node NFT minted successfully' },
    });
  } catch (error) {
    console.error('[NFT API] Failed to mint node NFT', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MINT_FAILED', message: (error as Error).message },
    });
  }
});

// POST /api/nft/property/mint - 铸造房源认证 NFT
router.post('/nft/property/mint', async (req: Request, res: Response) => {
  try {
    const {
      propertyId,
      propertyName,
      location,
      propertyType,
      hostDid,
      certifiedAt,
      expiresAt,
      verificationTxHash,
      complianceRegion,
    } = req.body;

    if (!propertyId || !propertyName || !location || !propertyType || !hostDid || !certifiedAt || !complianceRegion) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'Missing required fields' },
      });
    }

    const asset = await nftService.mintPropertyCertificateNFT({
      propertyId,
      propertyName,
      location,
      propertyType,
      hostDid,
      certifiedAt,
      expiresAt,
      verificationTxHash,
      complianceRegion,
    });

    return res.status(201).json({
      success: true,
      data: { asset, message: 'Property Certificate NFT minted successfully' },
    });
  } catch (error) {
    console.error('[NFT API] Failed to mint property certificate NFT', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MINT_FAILED', message: (error as Error).message },
    });
  }
});

// POST /api/nft/membership/mint - 铸造房东会员 NFT
router.post('/nft/membership/mint', async (req: Request, res: Response) => {
  try {
    const {
      hostDid,
      hostName,
      tier,
      memberSince,
      propertyCount,
      totalBookings,
      rating,
      benefits,
    } = req.body;

    if (!hostDid || !hostName || !tier || !memberSince || !propertyCount || !totalBookings || !rating || !benefits) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'Missing required fields' },
      });
    }

    if (!['silver', 'gold', 'diamond'].includes(tier)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TIER', message: 'Tier must be silver, gold, or diamond' },
      });
    }

    const asset = await nftService.mintHostMembershipNFT({
      hostDid,
      hostName,
      tier,
      memberSince,
      propertyCount,
      totalBookings,
      rating,
      benefits,
    });

    return res.status(201).json({
      success: true,
      data: { asset, message: 'Host Membership NFT minted successfully' },
    });
  } catch (error) {
    console.error('[NFT API] Failed to mint host membership NFT', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MINT_FAILED', message: (error as Error).message },
    });
  }
});

// GET /api/nft/:address - 获取 NFT 详情
router.get('/nft/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'address is required' },
      });
    }
    const asset = await nftService.getNFT(address);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'NFT_NOT_FOUND', message: 'NFT not found' },
      });
    }

    return res.json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    console.error('[NFT API] Failed to get NFT', error);
    return res.status(500).json({
      success: false,
      error: { code: 'GET_NFT_FAILED', message: 'Failed to get NFT' },
    });
  }
});

// GET /api/nft/user/:did - 获取用户的所有 NFT
router.get('/nft/user/:did', async (req: Request, res: Response) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'did is required' },
      });
    }
    const assets = await nftService.listUserNFTs(did);

    return res.json({
      success: true,
      data: { assets },
    });
  } catch (error) {
    console.error('[NFT API] Failed to list user NFTs', error);
    return res.status(500).json({
      success: false,
      error: { code: 'LIST_NFTS_FAILED', message: 'Failed to list NFTs' },
    });
  }
});

// POST /api/nft/:address/verify - 验证 NFT 所有权
router.post('/nft/:address/verify', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { ownerDid } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'address is required' },
      });
    }

    if (!ownerDid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: 'ownerDid is required' },
      });
    }

    const isValid = await nftService.verifyNFTOwnership(address, ownerDid);

    return res.json({
      success: true,
      data: { isValid },
    });
  } catch (error) {
    console.error('[NFT API] Failed to verify NFT', error);
    return res.status(500).json({
      success: false,
      error: { code: 'VERIFY_FAILED', message: 'Failed to verify NFT' },
    });
  }
});

// POST /api/nft/config - 配置 NFT Factory 地址
router.post('/nft/config', (req: Request, res: Response) => {
  try {
    const { nodeFactory, propertyCertificateFactory, hostMembershipFactories } = req.body;

    if (nodeFactory) {
      nftService.setNodeFactoryAddress(nodeFactory);
    }
    if (propertyCertificateFactory) {
      nftService.setPropertyCertificateFactoryAddress(propertyCertificateFactory);
    }
    if (hostMembershipFactories) {
      for (const [tier, address] of Object.entries(hostMembershipFactories)) {
        nftService.setHostMembershipFactoryAddress(tier, address as string);
      }
    }

    return res.json({
      success: true,
      data: { message: 'NFT configuration updated' },
    });
  } catch (error) {
    console.error('[NFT API] Failed to configure NFT', error);
    return res.status(500).json({
      success: false,
      error: { code: 'CONFIG_FAILED', message: 'Failed to configure NFT' },
    });
  }
});

export default router;

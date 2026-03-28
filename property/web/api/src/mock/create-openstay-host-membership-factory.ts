#!/usr/bin/env tsx

/* eslint-disable import/no-extraneous-dependencies */
// Usage:
//   OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx web/api/src/mock/create-openstay-host-membership-factory.ts create
//   pnpm exec tsx web/api/src/mock/create-openstay-host-membership-factory.ts svg [out]
import GraphQLClient from '@ocap/client';
import { fromTokenToUnit } from '@ocap/util';
import console from 'console';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import process from 'process';

import { buildHostMembershipSVG } from '../utils/nft/nft-svg';
import { loadEnv } from './libs/load-env';
import WalletUtil from './libs/wallet-util';

const DECIMAL = 18;

// 会员等级配置
const TIERS = {
  silver: { stake: 50, name: 'Silver', emoji: '🥈', color: 'url(#silver)' },
  gold: { stake: 200, name: 'Gold', emoji: '🥇', color: 'url(#gold)' },
  diamond: { stake: 500, name: 'Diamond', emoji: '💎', color: 'url(#diamond)' },
};

// 从环境变量获取助记词
function getMnemonic(): string {
  const mnemonic = process.env.OPENSTAY_MNEMONIC;
  if (!mnemonic) {
    throw new Error(
      'OPENSTAY_MNEMONIC environment variable is required.\n' +
      'Usage: OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx create-openstay-host-membership-factory.ts create'
    );
  }
  return mnemonic;
}

// OpenStay Host Membership NFT Factory
// 用于房东会员等级认证
const buildFactory = (tier: keyof typeof TIERS, token: { address: string; value: string }, issuerAddress: string) => {
  const tierConfig = TIERS[tier];
  
  return {
    name: `OpenStay ${tierConfig.name} Host Membership`,
    description: 
      `${tierConfig.name} tier membership for hosts on the OpenStay platform. ` +
      `Grants access to premium features, reduced platform fees, and priority support. ` +
      `Requires staking ${tierConfig.stake} ABT tokens.`,
    moniker: `OpenStayHost${tierConfig.name}`,
    settlement: 'instant',
    limit: 0,
    input: {
      tokens: [token],
      assets: [],
      variables: [
        { name: 'hostDid', required: true, type: 'string' },
        { name: 'hostName', required: true, type: 'string' },
        { name: 'tier', required: true, type: 'string' },
        { name: 'memberSince', required: true, type: 'string' },
        { name: 'propertyCount', required: true, type: 'number' },
        { name: 'totalBookings', required: true, type: 'number' },
        { name: 'rating', required: true, type: 'number' },
        { name: 'benefits', required: true, type: 'string' },
      ],
    },
    output: {
      moniker: '{{input.hostName}} - {{input.tier}} Host',
      data: {
        type: 'json',
        value: {
          hostDid: '{{input.hostDid}}',
          hostName: '{{input.hostName}}',
          tier: '{{input.tier}}',
          memberSince: '{{input.memberSince}}',
          propertyCount: '{{input.propertyCount}}',
          totalBookings: '{{input.totalBookings}}',
          rating: '{{input.rating}}',
          benefits: '{{input.benefits}}',
          status: 'active',
        },
      },
      display: {
        type: 'svg',
        content: buildHostMembershipSVG(),
      },
      readonly: false,
      transferrable: false,
      parent: '{{ctx.factory}}',
      issuer: '{{ctx.issuer.id}}',
      tags: ['OpenStayHost', 'Membership', tierConfig.name, 'Hospitality'],
    },
    data: {
      type: 'json',
      value: {
        hostDid: '{{data.hostDid}}',
        hostName: '{{data.hostName}}',
        tier: '{{data.tier}}',
        memberSince: '{{data.memberSince}}',
        propertyCount: '{{data.propertyCount}}',
        totalBookings: '{{data.totalBookings}}',
        rating: '{{data.rating}}',
        benefits: '{{data.benefits}}',
        status: '{{data.status}}',
      },
    },
    hooks: [
      {
        type: 'contract',
        name: 'mint',
        hook: `transferToken('${token.address}', '${issuerAddress}', '${token.value}');`,
      },
    ],
  };
};

function generateSVG(tier: keyof typeof TIERS, outputPath?: string) {
  const tierConfig = TIERS[tier];
  console.info(`Generating SVG for OpenStay ${tierConfig.name} Host Membership...`);

  const templateData = {
    silver: tier === 'silver',
    gold: tier === 'gold',
    diamond: tier === 'diamond',
    tierColor: tierConfig.color,
    tierEmoji: tierConfig.emoji,
    input: {
      tierName: tierConfig.name.toUpperCase(),
      hostName: 'Alice Chen',
      memberSince: '2024-01-15',
      propertyCount: '12',
      totalBookings: '342',
      benefits: tier === 'silver' 
        ? '5% fee reduction, Priority support'
        : tier === 'gold'
        ? '10% fee reduction, Priority support, Featured listings'
        : '15% fee reduction, 24/7 support, Featured listings, Early access',
    },
  };

  const svgTemplate = buildHostMembershipSVG();
  const svgContent = Mustache.render(svgTemplate, templateData);
  const svgPath = outputPath || path.join(process.cwd(), `openstay-host-${tier}-membership.svg`);

  fs.writeFileSync(svgPath, svgContent, 'utf-8');

  console.info('');
  console.info('✅ SVG generated successfully!');
  console.info(`📄 Output file: ${svgPath}`);
  console.info(`📊 File size: ${(svgContent.length / 1024).toFixed(2)} KB`);
  console.info('');
}

async function createFactory(tier: keyof typeof TIERS) {
  const env = await loadEnv();
  const mnemonic = getMnemonic();
  const wallet = WalletUtil.generateWalletFromMnemonic(mnemonic);
  const tierConfig = TIERS[tier];
  
  const token = {
    address: env.tokenId,
    value: fromTokenToUnit(tierConfig.stake, DECIMAL).toString(),
  };
  const client = new GraphQLClient(env.chainHost as unknown as string);

  console.info(`🏨 Creating OpenStay ${tierConfig.name} Host Membership NFT Factory...`);
  console.info('═══════════════════════════════════════════════');
  console.info(`🔗 Chain: ${env.chainHost}`);
  console.info(`💰 Token: ${token.address}`);
  console.info(`💵 Stake Required: ${token.value} (${tierConfig.stake} ABT)`);
  console.info(`👤 Issuer: ${wallet.address}`);
  console.info('═══════════════════════════════════════════════');
  console.info('');

  const factory = buildFactory(tier, token, wallet.address);
  const response = await (
    client as unknown as { createAssetFactory: (params: { wallet: unknown; factory: unknown }) => Promise<unknown> }
  ).createAssetFactory({ wallet, factory });
  
  console.info('✅ Factory created successfully!');
  console.info('📋 Response:', JSON.stringify(response, null, 2));
  console.info('');
  console.info(`⚠️  IMPORTANT: Set HOST_MEMBERSHIP_${tier.toUpperCase()}_FACTORY in your .env file`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'create';
  const tier = (args[1] || 'silver') as keyof typeof TIERS;

  if (!TIERS[tier]) {
    console.error(`❌ Error: Invalid tier "${tier}". Must be: silver, gold, or diamond`);
    process.exit(1);
  }

  try {
    if (command === 'create') {
      await createFactory(tier);
    } else if (command === 'svg') {
      const outputPath = args[2];
      generateSVG(tier, outputPath);
    } else {
      console.error(`❌ Error: Unknown command "${command}"`);
      console.error('');
      console.error('Usage:');
      console.error('  OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx create-openstay-host-membership-factory.ts create [silver|gold|diamond]');
      console.error('  pnpm exec tsx create-openstay-host-membership-factory.ts svg [silver|gold|diamond] [output]');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

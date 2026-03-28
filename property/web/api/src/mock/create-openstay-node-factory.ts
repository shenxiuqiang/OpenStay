#!/usr/bin/env tsx

/* eslint-disable import/no-extraneous-dependencies */
// Usage:
//   OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx web/api/src/mock/create-openstay-node-factory.ts create
//   pnpm exec tsx web/api/src/mock/create-openstay-node-factory.ts svg [out]
import GraphQLClient from '@ocap/client';
import { fromTokenToUnit } from '@ocap/util';
import console from 'console';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import process from 'process';

import { buildNodeNFTSVG } from '../utils/nft/nft-svg';
import { loadEnv } from './libs/load-env';
import WalletUtil from './libs/wallet-util';

const DECIMAL = 18;
const DEFAULT_STAKE = 100; // 默认质押 100 ABT

// 从环境变量获取助记词
function getMnemonic(): string {
  const mnemonic = process.env.OPENSTAY_MNEMONIC;
  if (!mnemonic) {
    throw new Error(
      'OPENSTAY_MNEMONIC environment variable is required.\n' +
      'Usage: OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx create-openstay-node-factory.ts create'
    );
  }
  return mnemonic;
}

// OpenStay Network Node NFT Factory
// 用于网络节点质押和激活
const buildFactory = (token: { address: string; value: string }, issuerAddress: string) => ({
  name: 'OpenStay Network Node',
  description:
    'Non-fungible asset representing a node in the OpenStay decentralized hospitality network. Each NFT establishes on-chain node identity, enables property indexing, and records essential node metadata including stake amount.',
  moniker: 'OpenStayNode',
  settlement: 'instant',
  limit: 0,
  input: {
    tokens: [token],
    assets: [],
    variables: [
      { name: 'name', required: true, type: 'string' },
      { name: 'endpoint', required: true, type: 'string' },
      { name: 'region', required: true, type: 'string' },
      { name: 'stake', required: true, type: 'number' },
      { name: 'capacity', required: true, type: 'number' },
      { name: 'owner', required: true, type: 'string' },
      { name: 'pk', required: true, type: 'string' },
    ],
  },
  output: {
    moniker: 'OpenStayNode #{{ctx.id}}',
    data: {
      type: 'json',
      value: {
        name: '{{input.name}}',
        endpoint: '{{input.endpoint}}',
        region: '{{input.region}}',
        stake: '{{input.stake}}',
        capacity: '{{input.capacity}}',
        owner: '{{input.owner}}',
        pk: '{{input.pk}}',
        status: 'active',
      },
    },
    display: {
      type: 'svg',
      content: buildNodeNFTSVG(),
    },
    readonly: false,
    transferrable: true,
    parent: '{{ctx.factory}}',
    issuer: '{{ctx.issuer.id}}',
    tags: ['OpenStayNode', 'NetworkNode', 'Hospitality'],
  },
  data: {
    type: 'json',
    value: {
      name: '{{data.name}}',
      endpoint: '{{data.endpoint}}',
      region: '{{data.region}}',
      stake: '{{data.stake}}',
      capacity: '{{data.capacity}}',
      owner: '{{data.owner}}',
      pk: '{{data.pk}}',
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
});

function generateSVG(outputPath?: string) {
  console.info('Generating SVG for OpenStay Node NFT...');

  const templateData = {
    ctx: { id: 1 },
    data: {
      name: 'Asia-Pacific Node #1',
      endpoint: 'https://node.openstay.network/apac-1',
      region: 'APAC-SG',
      stake: `${DEFAULT_STAKE}`,
      capacity: '10000',
      status: 'active',
    },
  };

  const svgTemplate = buildNodeNFTSVG();
  const svgContent = Mustache.render(svgTemplate, templateData);
  const svgPath = outputPath || path.join(process.cwd(), 'openstay-node-nft.svg');

  fs.writeFileSync(svgPath, svgContent, 'utf-8');

  console.info('');
  console.info('✅ SVG generated successfully!');
  console.info(`📄 Output file: ${svgPath}`);
  console.info(`📊 File size: ${(svgContent.length / 1024).toFixed(2)} KB`);
  console.info('');
}

async function createFactory() {
  const env = await loadEnv();
  const mnemonic = getMnemonic();
  const wallet = WalletUtil.generateWalletFromMnemonic(mnemonic);
  const token = {
    address: env.tokenId,
    value: fromTokenToUnit(DEFAULT_STAKE, DECIMAL).toString(),
  };
  const client = new GraphQLClient(env.chainHost as unknown as string);

  console.info('🏨 Creating OpenStay Network Node NFT Factory...');
  console.info('═══════════════════════════════════════════════');
  console.info(`🔗 Chain: ${env.chainHost}`);
  console.info(`💰 Token: ${token.address}`);
  console.info(`💵 Stake Value: ${token.value} (${DEFAULT_STAKE} ABT)`);
  console.info(`👤 Issuer: ${wallet.address}`);
  console.info('═══════════════════════════════════════════════');
  console.info('');

  const factory = buildFactory(token, wallet.address);
  const response = await (
    client as unknown as { createAssetFactory: (params: { wallet: unknown; factory: unknown }) => Promise<unknown> }
  ).createAssetFactory({ wallet, factory });
  
  console.info('✅ Factory created successfully!');
  console.info('📋 Response:', JSON.stringify(response, null, 2));
  console.info('');
  console.info('⚠️  IMPORTANT: Set NODE_NFT_FACTORY in your .env file');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'create';

  try {
    if (command === 'create') {
      await createFactory();
    } else if (command === 'svg') {
      const outputPath = args[1];
      generateSVG(outputPath);
    } else {
      console.error(`❌ Error: Unknown command "${command}"`);
      console.error('');
      console.error('Usage:');
      console.error('  OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx create-openstay-node-factory.ts create');
      console.error('  pnpm exec tsx create-openstay-node-factory.ts svg [output]');
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

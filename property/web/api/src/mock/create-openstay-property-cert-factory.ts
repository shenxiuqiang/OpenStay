#!/usr/bin/env tsx

/* eslint-disable import/no-extraneous-dependencies */
// Usage:
//   OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx web/api/src/mock/create-openstay-property-cert-factory.ts create
//   pnpm exec tsx web/api/src/mock/create-openstay-property-cert-factory.ts svg [out]
import GraphQLClient from '@ocap/client';
import { fromTokenToUnit } from '@ocap/util';
import console from 'console';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import process from 'process';

import { buildPropertyCertificateSVG } from '../utils/nft/nft-svg';
import { loadEnv } from './libs/load-env';
import WalletUtil from './libs/wallet-util';

const DECIMAL = 18;
const CERTIFICATION_FEE = 10; // 认证费用 10 ABT

// 从环境变量获取助记词
function getMnemonic(): string {
  const mnemonic = process.env.OPENSTAY_MNEMONIC;
  if (!mnemonic) {
    throw new Error(
      'OPENSTAY_MNEMONIC environment variable is required.\n' +
      'Usage: OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx create-openstay-property-cert-factory.ts create'
    );
  }
  return mnemonic;
}

/** 前后各取 head/tail 位，中间三点 */
function truncateMiddle(str: string, head = 6, tail = 6): string {
  if (!str || str.length <= head + tail) return str;
  return `${str.slice(0, head)}...${str.slice(-tail)}`;
}

// OpenStay Property Certificate NFT Factory
// 用于房源认证证书
const buildFactory = (token: { address: string; value: string }, issuerAddress: string) => ({
  name: 'OpenStay Verified Property Certificate',
  description:
    'Non-fungible asset representing a verified property listing on the OpenStay platform. Each NFT establishes on-chain proof of property authenticity, compliance with local regulations, and host identity verification.',
  moniker: 'OpenStayPropertyCert',
  settlement: 'instant',
  limit: 0,
  input: {
    tokens: [token],
    assets: [],
    variables: [
      { name: 'propertyId', required: true, type: 'string' },
      { name: 'propertyName', required: true, type: 'string' },
      { name: 'location', required: true, type: 'string' },
      { name: 'propertyType', required: true, type: 'string' },
      { name: 'hostDid', required: true, type: 'string' },
      { name: 'certifiedAt', required: true, type: 'string' },
      { name: 'expiresAt', required: false, type: 'string' },
      { name: 'verificationTxHash', required: false, type: 'string' },
      { name: 'complianceRegion', required: true, type: 'string' },
    ],
  },
  output: {
    moniker: '{{input.propertyName}} Certificate',
    data: {
      type: 'json',
      value: {
        propertyId: '{{input.propertyId}}',
        propertyName: '{{input.propertyName}}',
        location: '{{input.location}}',
        propertyType: '{{input.propertyType}}',
        hostDid: '{{input.hostDid}}',
        certifiedAt: '{{input.certifiedAt}}',
        expiresAt: '{{input.expiresAt}}',
        verificationTxHash: '{{input.verificationTxHash}}',
        complianceRegion: '{{input.complianceRegion}}',
        status: 'verified',
      },
    },
    display: {
      type: 'svg',
      content: buildPropertyCertificateSVG(),
    },
    readonly: false,
    transferrable: false,
    parent: '{{ctx.factory}}',
    issuer: '{{ctx.issuer.id}}',
    tags: ['OpenStayProperty', 'VerifiedListing', 'Hospitality'],
  },
  data: {
    type: 'json',
    value: {
      propertyId: '{{data.propertyId}}',
      propertyName: '{{data.propertyName}}',
      location: '{{data.location}}',
      propertyType: '{{data.propertyType}}',
      hostDid: '{{data.hostDid}}',
      certifiedAt: '{{data.certifiedAt}}',
      expiresAt: '{{data.expiresAt}}',
      verificationTxHash: '{{data.verificationTxHash}}',
      complianceRegion: '{{data.complianceRegion}}',
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
  console.info('Generating SVG for OpenStay Property Certificate...');

  const fullDid = 'z1WmC5oi8gp16gkN78qB37pzeUqVDCC398a';
  const rawTime = new Date().toISOString();

  const templateData = {
    input: {
      propertyName: 'Cozy Apartment in Downtown',
      propertyId: 'prop_001',
      location: 'Shanghai, China',
      certifiedAt: rawTime.split('T')[0],
      hostDisplay: truncateMiddle(fullDid, 6, 6),
    },
  };

  const svgTemplate = buildPropertyCertificateSVG();
  const svgContent = Mustache.render(svgTemplate, templateData);
  const svgPath = outputPath || path.join(process.cwd(), 'openstay-property-certificate.svg');

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
    value: fromTokenToUnit(CERTIFICATION_FEE, DECIMAL).toString(),
  };
  const client = new GraphQLClient(env.chainHost as unknown as string);

  console.info('🏨 Creating OpenStay Property Certificate NFT Factory...');
  console.info('═══════════════════════════════════════════════');
  console.info(`🔗 Chain: ${env.chainHost}`);
  console.info(`💰 Token: ${token.address}`);
  console.info(`💵 Certification Fee: ${token.value} (${CERTIFICATION_FEE} ABT)`);
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
  console.info('⚠️  IMPORTANT: Set PROPERTY_CERTIFICATE_FACTORY in your .env file');
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
      console.error('  OPENSTAY_MNEMONIC="your mnemonic" pnpm exec tsx create-openstay-property-cert-factory.ts create');
      console.error('  pnpm exec tsx create-openstay-property-cert-factory.ts svg [output]');
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

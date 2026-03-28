import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

export interface EnvConfig {
  chainHost: string;
  tokenId: string;
  nodeNFTFactory?: string;
  propertyCertificateFactory?: string;
  hostMembershipFactory?: string;
}

export async function loadEnv(): Promise<EnvConfig> {
  // Try to load from different locations
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '../.env'),
    path.join(process.cwd(), '../../.env'),
    path.join(process.cwd(), '../../../.env'),
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }

  // Default values for ArcBlock testnet
  const config: EnvConfig = {
    chainHost: process.env.CHAIN_HOST || 'https://beta.abtnetwork.io/api',
    tokenId: process.env.TOKEN_ID || 'z35n6UoVxBsV9dUHVHC8uhkZU2L4qh9PZW52',
    nodeNFTFactory: process.env.NODE_NFT_FACTORY,
    propertyCertificateFactory: process.env.PROPERTY_CERTIFICATE_FACTORY,
    hostMembershipFactory: process.env.HOST_MEMBERSHIP_FACTORY,
  };

  return config;
}

import { createRequire } from 'module';
import process from 'process';

// svgo 优化器缓存（懒加载）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let svgoOptimize: ((svg: string, options?: any) => { data: string }) | null = null;

/**
 * 使用 svgo 压缩 SVG 字符串
 * @param svg - 原始 SVG 字符串
 * @returns 压缩后的 SVG 字符串
 */
export function compressSVG(svg: string): string {
  // 尝试使用 svgo 进行优化
  if (!svgoOptimize) {
    try {
      const localRequire = createRequire(process.cwd());
      const svgo = localRequire('svgo');
      svgoOptimize = svgo.optimize;
    } catch {
      // svgo 不可用，使用简单压缩
    }
  }

  if (svgoOptimize) {
    try {
      const result = svgoOptimize(svg, {
        multipass: true,
        plugins: [
          'removeDoctype',
          'removeXMLProcInst',
          'removeComments',
          'removeMetadata',
          'cleanupAttrs',
          'mergeStyles',
          'inlineStyles',
          'minifyStyles',
          'cleanupIds',
          'removeUselessDefs',
          'cleanupNumericValues',
          'convertColors',
          'removeUnknownsAndDefaults',
          'removeUselessStrokeAndFill',
          'removeHiddenElems',
          'removeEmptyText',
          'convertShapeToPath',
          'moveElemsAttrsToGroup',
          'moveGroupAttrsToElems',
          'collapseGroups',
          'convertPathData',
          'convertTransform',
          'removeEmptyAttrs',
          'removeEmptyContainers',
          'mergePaths',
          'removeUnusedNS',
          'sortAttrs',
          'removeTitle',
          'removeDesc',
          'removeDimensions',
          'removeStyleElement',
        ],
      });
      return result.data;
    } catch {
      // svgo 优化失败，使用简单压缩作为后备
    }
  }

  // 后备方案：使用简单的同步压缩方法
  return svg
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * 生成 OpenStay Node NFT 的 SVG 显示内容
 * 用于网络节点质押和激活
 */
export function buildNodeNFTSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a365d"/>
      <stop offset="50%" stop-color="#2c5282"/>
      <stop offset="100%" stop-color="#1a365d"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f6ad55"/>
      <stop offset="100%" stop-color="#ed8936"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="500" height="315" fill="url(#bg)" rx="16"/>
  <rect x="8" y="8" width="484" height="299" fill="none" stroke="url(#accent)" stroke-width="2" opacity="0.6" rx="12"/>
  
  <!-- Logo Area -->
  <circle cx="60" cy="50" r="25" fill="url(#accent)" opacity="0.2"/>
  <path d="M45 50 L55 40 L75 40 L75 60 L55 60 Z" fill="none" stroke="url(#accent)" stroke-width="2"/>
  <path d="M50 55 L55 50 L65 50 L70 55" fill="none" stroke="url(#accent)" stroke-width="1.5"/>
  
  <text x="95" y="45" font-weight="bold" font-size="14" fill="#f7fafc">OpenStay</text>
  <text x="95" y="62" font-size="10" fill="#a0aec0">Network Node</text>
  
  <!-- Title -->
  <text x="250" y="110" font-size="28" font-weight="bold" text-anchor="middle" fill="#f7fafc" filter="url(#glow)">OpenStay Node #{{ctx.id}}</text>
  
  <!-- Divider -->
  <line x1="40" y1="130" x2="460" y2="130" stroke="#4a5568" stroke-width="1" opacity="0.5"/>
  
  <!-- Info Grid -->
  <text x="40" y="160" font-size="11" fill="#a0aec0" font-weight="500">Node Name</text>
  <text x="40" y="178" font-size="12" fill="#f7fafc">{{data.name}}</text>
  
  <text x="280" y="160" font-size="11" fill="#a0aec0" font-weight="500">Region</text>
  <text x="280" y="178" font-size="12" fill="#f7fafc">{{data.region}}</text>
  
  <text x="40" y="205" font-size="11" fill="#a0aec0" font-weight="500">Endpoint</text>
  <text x="40" y="223" font-size="11" fill="#e2e8f0">{{data.endpoint}}</text>
  
  <text x="280" y="205" font-size="11" fill="#a0aec0" font-weight="500">Stake Amount</text>
  <text x="280" y="223" font-size="14" fill="url(#accent)" font-weight="bold">{{data.stake}} ABT</text>
  
  <text x="40" y="250" font-size="11" fill="#a0aec0" font-weight="500">Status</text>
  <circle cx="45" cy="265" r="4" fill="#48bb78"/>
  <text x="55" y="268" font-size="11" fill="#48bb78">{{data.status}}</text>
  
  <text x="280" y="250" font-size="11" fill="#a0aec0" font-weight="500">Capacity</text>
  <text x="280" y="268" font-size="11" fill="#e2e8f0">{{data.capacity}} properties</text>
  
  <!-- Footer -->
  <text x="250" y="295" font-size="10" text-anchor="middle" fill="#718096">Decentralized Hospitality Network</text>
</svg>`;

  return compressSVG(svg);
}

/**
 * 生成 OpenStay Property Certificate NFT 的 SVG 显示内容
 * 用于房源认证证书
 */
export function buildPropertyCertificateSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#234e52"/>
      <stop offset="50%" stop-color="#285e61"/>
      <stop offset="100%" stop-color="#234e52"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbd38d"/>
      <stop offset="50%" stop-color="#f6ad55"/>
      <stop offset="100%" stop-color="#ed8936"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="500" height="315" fill="url(#bg)" rx="16"/>
  <rect x="8" y="8" width="484" height="299" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.6" rx="12"/>
  
  <!-- Badge Icon -->
  <circle cx="250" cy="55" r="30" fill="url(#gold)" opacity="0.15"/>
  <path d="M235 45 L250 35 L265 45 L265 60 L250 70 L235 60 Z" fill="none" stroke="url(#gold)" stroke-width="2"/>
  <path d="M245 52 L250 48 L258 55" fill="none" stroke="url(#gold)" stroke-width="2"/>
  <circle cx="250" cy="55" r="3" fill="url(#gold)"/>
  
  <!-- Title -->
  <text x="250" y="105" font-size="11" fill="#a0aec0" text-anchor="middle">VERIFIED PROPERTY CERTIFICATE</text>
  <text x="250" y="135" font-size="22" font-weight="bold" text-anchor="middle" fill="#f7fafc" filter="url(#glow)">{{input.propertyName}}</text>
  
  <!-- Divider -->
  <line x1="50" y1="155" x2="450" y2="155" stroke="#4a5568" stroke-width="1" opacity="0.5"/>
  
  <!-- Property Details -->
  <text x="50" y="180" font-size="10" fill="#a0aec0">Property ID</text>
  <text x="50" y="195" font-size="10" fill="#e2e8f0">{{input.propertyId}}</text>
  
  <text x="280" y="180" font-size="10" fill="#a0aec0">Location</text>
  <text x="280" y="195" font-size="10" fill="#e2e8f0">{{input.location}}</text>
  
  <text x="50" y="220" font-size="10" fill="#a0aec0">Certification Date</text>
  <text x="50" y="235" font-size="10" fill="#e2e8f0">{{input.certifiedAt}}</text>
  
  <text x="280" y="220" font-size="10" fill="#a0aec0">Host</text>
  <text x="280" y="235" font-size="10" fill="#e2e8f0">{{input.hostDisplay}}</text>
  
  <!-- Verification Badge -->
  <rect x="180" y="255" width="140" height="28" fill="url(#gold)" opacity="0.2" rx="14"/>
  <text x="250" y="273" font-size="11" text-anchor="middle" fill="url(#gold)" font-weight="bold">✓ VERIFIED BY OPENVNODE</text>
  
  <text x="250" y="305" font-size="9" text-anchor="middle" fill="#718096">OpenStay Decentralized Hospitality Network</text>
</svg>`;

  return compressSVG(svg);
}

/**
 * 生成 OpenStay Host Membership NFT 的 SVG 显示内容
 * 用于房东会员等级证书
 */
export function buildHostMembershipSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315">
  <defs>
    <linearGradient id="bg-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a5568"/>
      <stop offset="50%" stop-color="#718096"/>
      <stop offset="100%" stop-color="#4a5568"/>
    </linearGradient>
    <linearGradient id="bg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#744210"/>
      <stop offset="50%" stop-color="#b7791f"/>
      <stop offset="100%" stop-color="#744210"/>
    </linearGradient>
    <linearGradient id="bg-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b6cb0"/>
      <stop offset="50%" stop-color="#4299e1"/>
      <stop offset="100%" stop-color="#2b6cb0"/>
    </linearGradient>
    <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#a0aec0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbd38d"/>
      <stop offset="100%" stop-color="#ed8936"/>
    </linearGradient>
    <linearGradient id="diamond" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#90cdf4"/>
      <stop offset="100%" stop-color="#4299e1"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <!-- Dynamic Background based on tier -->
  {{#silver}}
  <rect width="500" height="315" fill="url(#bg-silver)" rx="16"/>
  <rect x="8" y="8" width="484" height="299" fill="none" stroke="url(#silver)" stroke-width="2" opacity="0.6" rx="12"/>
  {{/silver}}
  {{#gold}}
  <rect width="500" height="315" fill="url(#bg-gold)" rx="16"/>
  <rect x="8" y="8" width="484" height="299" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.6" rx="12"/>
  {{/gold}}
  {{#diamond}}
  <rect width="500" height="315" fill="url(#bg-diamond)" rx="16"/>
  <rect x="8" y="8" width="484" height="299" fill="none" stroke="url(#diamond)" stroke-width="2" opacity="0.6" rx="12"/>
  {{/diamond}}
  
  <!-- Tier Badge -->
  <circle cx="250" cy="60" r="35" fill="{{tierColor}}" opacity="0.2"/>
  <text x="250" y="70" font-size="36" text-anchor="middle" fill="{{tierColor}}" filter="url(#glow)">{{tierEmoji}}</text>
  
  <!-- Title -->
  <text x="250" y="115" font-size="12" fill="#a0aec0" text-anchor="middle">HOST MEMBERSHIP</text>
  <text x="250" y="145" font-size="26" font-weight="bold" text-anchor="middle" fill="#f7fafc">{{input.tierName}} HOST</text>
  
  <!-- Divider -->
  <line x1="60" y1="165" x2="440" y2="165" stroke="#4a5568" stroke-width="1" opacity="0.5"/>
  
  <!-- Member Info -->
  <text x="60" y="190" font-size="11" fill="#a0aec0">Host Name</text>
  <text x="60" y="208" font-size="14" fill="#f7fafc" font-weight="500">{{input.hostName}}</text>
  
  <text x="300" y="190" font-size="11" fill="#a0aec0">Member Since</text>
  <text x="300" y="208" font-size="12" fill="#e2e8f0">{{input.memberSince}}</text>
  
  <text x="60" y="235" font-size="11" fill="#a0aec0">Properties Listed</text>
  <text x="60" y="253" font-size="12" fill="#e2e8f0">{{input.propertyCount}}</text>
  
  <text x="300" y="235" font-size="11" fill="#a0aec0">Total Bookings</text>
  <text x="300" y="253" font-size="12" fill="#e2e8f0">{{input.totalBookings}}</text>
  
  <!-- Benefits -->
  <text x="250" y="275" font-size="10" text-anchor="middle" fill="#a0aec0">Benefits: {{input.benefits}}</text>
  
  <text x="250" y="305" font-size="10" text-anchor="middle" fill="#718096">OpenStay Host Program</text>
</svg>`;

  return compressSVG(svg);
}

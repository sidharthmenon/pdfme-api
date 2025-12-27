import crypto from 'crypto';
import { checkTemplate } from '@pdfme/common';
import { redis } from './redis.js';

const CACHE_TTL_SECONDS = Number(process.env.TEMPLATE_CACHE_TTL || 3600);

/**
 * Generate a stable Redis key for a template URL
 */
const getCacheKey = (url) =>
  `pdfme:template:${crypto.createHash('sha256').update(url).digest('hex')}`;

/**
 * Load template from Redis cache or remote URL
 */
export const loadRemoteTemplateCached = async (url) => {
  const cacheKey = getCacheKey(url);

  // 1️⃣ Try Redis first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const template = JSON.parse(cached);      
      checkTemplate(template);
      return template;
    }
  } catch (err) {
    // Redis failure should NOT block PDF generation
    console.warn('Redis cache read failed, falling back to fetch:', err.message);
  }

  // 2️⃣ Fetch from remote
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch template: ${res.status}`);
  }

  const template = await res.json();

  // 3️⃣ Validate template
  checkTemplate(template);

  // 4️⃣ Cache result
  try {
    await redis.set(
      cacheKey,
      JSON.stringify(template),
      'EX',
      CACHE_TTL_SECONDS
    );
  } catch (err) {
    console.warn('Redis cache write failed:', err.message);
  }

  return template;
};

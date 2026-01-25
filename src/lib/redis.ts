import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('UPSTASH_REDIS environment variables are missing. AI caching will be disabled.');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

/**
 * Generates a consistent cache key for a specific question within a subject.
 */
export function getCacheKey(subjectId: string, questionText: string): string {
  // Normalize and clean the question text for better hit rate
  const normalizedQuestion = questionText
    .trim()
    .toLowerCase()
    .replace(/[?.!,]/g, '');
    
  // Use a simple hash or base64 to avoid special character issues in Redis keys
  const hash = Buffer.from(normalizedQuestion).toString('base64').substring(0, 64);
  
  return `ai_cache:${subjectId}:${hash}`;
}

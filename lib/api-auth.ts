import { headers } from 'next/headers';

const API_KEY = process.env.API_KEY || 'flat-manager-api-key';

export async function validateApiKey(): Promise<boolean> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  return apiKey === API_KEY;
}

export function getApiKeyHeader(): Record<string, string> {
  return { 'X-API-Key': API_KEY };
}
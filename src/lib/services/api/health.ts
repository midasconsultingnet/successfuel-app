// Health check API service
import { APP_CONFIG } from '$lib/utils/constants';

export interface HealthResponse {
  status: string;
  message: string;
}

export class HealthAPI {
  static async check(): Promise<HealthResponse> {
    // Make a direct fetch to the health check endpoint
    // For client-side usage, we can use global fetch
    const response = await fetch(`${APP_CONFIG.API.HEALTH_CHECK_URL}`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Server-side version that uses SvelteKit's load function fetch
  static async checkWithLoadFetch(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>): Promise<HealthResponse> {
    const response = await fetch(`${APP_CONFIG.API.HEALTH_CHECK_URL}`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }
}

export default HealthAPI;
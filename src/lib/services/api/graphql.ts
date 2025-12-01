// GraphQL API service
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { APP_CONFIG } from '$lib/utils/constants';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export class GraphQLAPI {
  static async request<T = any>(query: string, variables?: Record<string, any>): Promise<GraphQLResponse<T>> {
    // Get auth state
    const authState = get(auth);

    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    };

    // Add auth token if available
    if (authState.token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${authState.token}`;
    }

    const response = await fetch(`${APP_CONFIG.API.GRAPHQL_URL}`, config);

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }
}

export default GraphQLAPI;
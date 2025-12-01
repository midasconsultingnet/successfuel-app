import { checkAuthInLoad } from '$lib/utils/protectedLoad';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  // Check authentication and redirect if not authenticated
  await checkAuthInLoad(event);
  
  // If we reach here, the user is authenticated
  return {};
};
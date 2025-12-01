import type { PageLoad } from './$types';

// For Tauri apps, we don't do server-side auth checks that redirect
// The authentication will be handled on the client-side in the component
export const load: PageLoad = async (event) => {
  return {};
};
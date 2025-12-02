import { writable } from 'svelte/store';
import type { ConnectivityStatus } from '$lib/services/connectivity';

const initialStatus: ConnectivityStatus = {
  isApiHealthy: false,
  isDbHealthy: false,
  lastChecked: null,
  isChecking: false
};

export const connectivityStore = writable<ConnectivityStatus>(initialStatus);
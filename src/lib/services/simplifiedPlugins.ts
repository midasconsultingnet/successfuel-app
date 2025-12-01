// Simplified plugin/feature management system
import { writable } from 'svelte/store';
import type { FeatureFlag } from '$lib/types/plugins';

// Define available features with their feature flags
const FEATURES: Record<string, FeatureFlag> = {
  gas_station_management: {
    id: 'gas_station_management',
    name: 'Gas Station Management',
    enabled: true,
    permissions: ['gas_station_read', 'gas_station_write']
  },
  inventory_tracking: {
    id: 'inventory_tracking',
    name: 'Inventory Tracking',
    enabled: true,
    permissions: ['inventory_read', 'inventory_write']
  },
  sales_reporting: {
    id: 'sales_reporting',
    name: 'Sales Reporting',
    enabled: true,
    permissions: ['reports_read']
  },
  employee_management: {
    id: 'employee_management',
    name: 'Employee Management',
    enabled: false, // Disabled by default
    permissions: ['employee_read', 'employee_write']
  },
  // Add more features as needed
};

// Create a store for feature flags
function createFeatureStore() {
  const { subscribe, set, update } = writable<Record<string, FeatureFlag>>(FEATURES);

  return {
    subscribe,
    
    // Get a specific feature
    getFeature(featureId: string): FeatureFlag | undefined {
      return FEATURES[featureId];
    },
    
    // Check if a feature is enabled
    isFeatureEnabled(featureId: string): boolean {
      const feature = FEATURES[featureId];
      return feature ? feature.enabled : false;
    },
    
    // Check if user has permission for a feature
    hasPermissionForFeature(featureId: string, userPermissions: string[]): boolean {
      const feature = FEATURES[featureId];
      if (!feature) return false;
      
      // If feature has no specific permissions, anyone can access it
      if (!feature.permissions || feature.permissions.length === 0) return true;
      
      // Check if user has any of the required permissions
      return feature.permissions.some(permission => userPermissions.includes(permission));
    },
    
    // Toggle feature (for admin use)
    toggleFeature(featureId: string): void {
      update(features => {
        if (features[featureId]) {
          const updated = { ...features };
          updated[featureId] = {
            ...updated[featureId],
            enabled: !updated[featureId].enabled
          };
          return updated;
        }
        return features;
      });
    }
  };
}

export const features = createFeatureStore();

// Component registry for feature components
export const FEATURE_COMPONENTS: Record<string, string> = {
  gas_station_management: 'GasStationDashboard',
  inventory_tracking: 'InventoryTracker',
  sales_reporting: 'SalesReport',
  employee_management: 'EmployeeManager',
  // Add more components as needed
};

// Feature guard component logic
export function hasAccessToFeature(featureId: string, userPermissions: string[]): boolean {
  return features.hasPermissionForFeature(featureId, userPermissions) && 
         features.isFeatureEnabled(featureId);
}
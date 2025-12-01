<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { getAuthService } from '$lib/services/auth'; // Updated import
  import type { Permission } from '$lib/types/auth';

  // Props for the PermissionGuard
  let { 
    requiredPermission = '',
    requiredPermissions = [],
    requireAll = true, // If true, all permissions are required, otherwise any one is sufficient
    fallback = 'hide', // 'hide', 'disable', 'redirect'
    redirectPath = '/unauthorized'
  } = $props<{
    requiredPermission?: string;
    requiredPermissions?: string[];
    requireAll?: boolean; // Applicable only when requiredPermissions is used
    fallback?: 'hide' | 'disable' | 'redirect';
    redirectPath?: string;
  }>();

  let hasPermission = $state(false);
  let hasAllPermissions = $state(true);
  let hasAnyPermission = $state(false);

  // Check permissions when component mounts and when auth state changes
  $effect(() => {
    const authState = get(auth);
    
    // Check single permission
    if (requiredPermission) {
      hasPermission = authState.permissions.some(perm => 
        perm.libelle === requiredPermission || perm.name === requiredPermission
      );
    }
    
    // Check multiple permissions
    if (requiredPermissions.length > 0) {
      if (requireAll) {
        hasAllPermissions = requiredPermissions.every(perm => 
          authState.permissions.some(p => p.libelle === perm || p.name === perm)
        );
      } else {
        hasAnyPermission = requiredPermissions.some(perm => 
          authState.permissions.some(p => p.libelle === perm || p.name === perm)
        );
      }
    }
  });

  let canShow = $derived(() => {
    if (requiredPermission) {
      return hasPermission;
    } else if (requiredPermissions.length > 0) {
      return requireAll ? hasAllPermissions : hasAnyPermission;
    }
    return true; // If no permissions specified, allow access
  });

  // Handle redirect if needed
  $effect(() => {
    if (!canShow && fallback === 'redirect') {
      goto(redirectPath);
    }
  });
</script>

{#if canShow}
  <slot />
{:else if fallback === 'hide'}
  <!-- Content is hidden if no permission -->
{:else if fallback === 'disable'}
  <div class="permission-disabled">
    <slot name="disabled" />
  </div>
{:else if fallback === 'redirect'}
  <!-- Will be redirected (handled by $effect above) -->
  <div class="no-access">Access denied</div>
{/if}

<style>
  .permission-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { translationStore } from '$lib/i18n/TranslationRegistry';

  let { key, params }: { key: string; params?: Record<string, any> } = $props<{ key: string; params?: Record<string, any> }>();

  let currentTranslation = $state(key);
  let unsubscribe: () => void | null = null;

  // Initialize with the current translation
  $effect(() => {
    // Immediately set the initial value
    const initialStore = translationStore(key, params);
    currentTranslation = get(initialStore);
    
    // Subscribe to updates
    unsubscribe = initialStore.subscribe(value => {
      currentTranslation = value;
    });
    
    // Clean up subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });
  
  // Update when props change
  $effect(() => {
    const newKey = key;
    const newParams = params;
    
    if (unsubscribe) {
      unsubscribe(); // Unsubscribe from old store
    }
    
    const newStore = translationStore(newKey, newParams);
    currentTranslation = get(newStore);
    
    unsubscribe = newStore.subscribe(value => {
      currentTranslation = value;
    });
  });
</script>

<span>{currentTranslation}</span>
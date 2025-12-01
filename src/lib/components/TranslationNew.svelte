<script lang="ts">
  import { get } from 'svelte/store';
  import { translationStore } from '$lib/i18n/TranslationRegistry';

  let { key, params }: { key: string; params?: Record<string, any> } = $props<{ key: string; params?: Record<string, any> }>();

  let currentTranslation = $state(key);
  let unsubscribe: (() => void) | null = null;

  // Initialize and subscribe to translation changes
  $effect(() => {
    const store = translationStore(key, params);
    currentTranslation = get(store);

    unsubscribe = store.subscribe(value => {
      currentTranslation = value;
    });

    // Cleanup on component destruction
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });

  // Update subscription when props change
  $effect(() => {
    const newKey = key;
    const newParams = params;

    if (unsubscribe) {
      unsubscribe();
    }

    const store = translationStore(newKey, newParams);
    currentTranslation = get(store);

    unsubscribe = store.subscribe(value => {
      currentTranslation = value;
    });
  });
</script>

<span>{currentTranslation}</span>
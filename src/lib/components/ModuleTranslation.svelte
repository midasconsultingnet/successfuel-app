<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { translationStore } from '$lib/i18n/TranslationRegistry';

  let { key, params }: { key: string; params?: Record<string, any> } = $props<{ key: string; params?: Record<string, any> }>();

  let currentTranslation = $state(key);

  // Subscribe to translation changes
  $effect(() => {
    const translation$ = translationStore(key, params);
    const unsubscribe = translation$.subscribe(value => {
      currentTranslation = value;
    });
    
    return unsubscribe;
  });
</script>

<span>{currentTranslation}</span>
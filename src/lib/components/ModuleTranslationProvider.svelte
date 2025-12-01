<script lang="ts">
  import { onMount } from 'svelte';
  import { setContext } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import type { Language } from '$lib/i18n/i18n';
  import { language } from '$lib/i18n/languageStore';
  import { getTranslation, registerModuleTranslations } from '$lib/i18n/TranslationRegistry';
  import type { Readable } from 'svelte/store';

  let { moduleId, moduleTranslations }: { moduleId: string; moduleTranslations?: Record<Language, any> } = $props<{ 
    moduleId: string; 
    moduleTranslations?: Record<Language, any> 
  }>();

  // Register the module translations if provided
  onMount(() => {
    if (moduleTranslations) {
      registerModuleTranslations(moduleId, moduleTranslations);
    }
  });

  // Translation function for this module context
  function t(key: string, params?: Record<string, any>): string {
    return getTranslation(`${moduleId}.${key}`, params);
  }

  // Function to create a reactive translation store
  function translationStore(key: string, params?: Record<string, any>): Readable<string> {
    return derived(
      [language],
      ([$language]) => {
        return getTranslation(`${moduleId}.${key}`, params);
      }
    );
  }

  // Set context for this module
  const moduleI18nContext = {
    t,
    translationStore,
    language
  };

  setContext('moduleI18n', moduleI18nContext);

  // Export the context functions for direct use if needed
  export { t, translationStore };
</script>

<slot />
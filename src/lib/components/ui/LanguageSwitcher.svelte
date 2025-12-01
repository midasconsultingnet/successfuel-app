<script lang="ts">
  import { APP_CONFIG } from '$lib/utils/constants';

  let currentLocale = $state(APP_CONFIG.DEFAULT_LANGUAGE || 'fr');
  let availableLocales = $state(APP_CONFIG.SUPPORTED_LANGUAGES || []);

  $effect(() => {
    currentLocale = APP_CONFIG.DEFAULT_LANGUAGE || 'fr';
  });

  function switchLanguage(newLocale: string) {
    // In the simplified system, just update state without actual locale change
    currentLocale = newLocale;
  }
</script>

<div class="language-switcher">
  {#each availableLocales as locale}
    <button
      class={`lang-btn ${currentLocale === locale ? 'active' : ''}`}
      on:click={() => switchLanguage(locale)}
      aria-label={`Switch to ${locale.toUpperCase()}`}
    >
      {locale.toUpperCase()}
    </button>
  {/each}
</div>

<style>
  .language-switcher {
    display: flex;
    gap: 0.5rem;
  }

  .lang-btn {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 3px;
  }

  .lang-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .lang-btn:hover {
    background: #f0f0f0;
  }
</style>
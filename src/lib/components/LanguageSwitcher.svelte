<script lang="ts">
  import { language, setLanguage, type Language } from '$lib/i18n/languageStore';
  import { onMount } from 'svelte';
  import { useI18n } from '$lib/hooks/useI18n';

  // Get the i18n context
  const { lang } = useI18n();

  let currentLanguage = $state<Language>('en');

  // Track language changes
  $effect(() => {
    const unsubscribe = language.subscribe(value => {
      currentLanguage = value;
    });
    return unsubscribe;
  });

  function switchLanguage(lang: Language) {
    setLanguage(lang);
  }
</script>

<div class="language-switcher">
  <button
    class="lang-btn"
    class:active={currentLanguage === 'en'}
    on:click={() => switchLanguage('en')}
    aria-label="Switch to English"
  >
    EN
  </button>
  <button
    class="lang-btn"
    class:active={currentLanguage === 'fr'}
    on:click={() => switchLanguage('fr')}
    aria-label="Switch to French"
  >
    FR
  </button>
</div>

<style>
  .language-switcher {
    display: flex;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
  }

  .lang-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    background: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .lang-btn:hover {
    background-color: #f0f0f0;
  }

  .lang-btn.active {
    background-color: #007bff;
    color: white;
  }
</style>
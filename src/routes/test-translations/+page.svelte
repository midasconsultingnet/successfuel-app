<script lang="ts">
  import ModuleTranslationProvider from '$lib/components/ModuleTranslationProvider.svelte';
  import ModuleTranslation from '$lib/components/ModuleTranslation.svelte';
  import TranslationNew from '$lib/components/TranslationNew.svelte';
  import { onMount } from 'svelte';
  import { language, setLanguage } from '$lib/i18n/languageStore';
  import { get } from 'svelte/store';
  import { salesEnTranslations, salesFrTranslations } from '$lib/i18n/modules/sales.translations';
  
  // Test state
  let testValue = $state('initial');
  let currentLang = $state(get(language));
  
  // Set up language change listener
  $effect(() => {
    const unsubscribe = language.subscribe(value => {
      currentLang = value;
    });
    return unsubscribe;
  });
  
  function changeToEnglish() {
    setLanguage('en');
  }
  
  function changeToFrench() {
    setLanguage('fr');
  }
  
  // Module translations
  const moduleTranslations = {
    en: salesEnTranslations,
    fr: salesFrTranslations
  };
</script>

<div class="test-page">
  <h1>Translation System Test</h1>
  
  <div class="language-controls">
    <h2>Language: {currentLang.toUpperCase()}</h2>
    <button on:click={changeToEnglish} class="lang-btn en">English</button>
    <button on:click={changeToFrench} class="lang-btn fr">Français</button>
  </div>
  
  <div class="translation-tests">
    <h2>Core Translations (using TranslationNew)</h2>
    <ul>
      <li>Dashboard: <TranslationNew key="common.dashboard" /></li>
      <li>Login: <TranslationNew key="common.login" /></li>
      <li>Logout: <TranslationNew key="common.logout" /></li>
      <li>Welcome: <TranslationNew key="dashboard.welcome" params={{ name: "Test User" }} /></li>
      <li>Gas Station Pumps: <TranslationNew key="gasStation.pumps" /></li>
    </ul>
    
    <h2>Module Translations (using ModuleTranslation)</h2>
    <ModuleTranslationProvider moduleId="sales" {moduleTranslations}>
      <ul>
        <li>Sales Title: <ModuleTranslation key="title" /></li>
        <li>New Sale: <ModuleTranslation key="newSale" /></li>
        <li>Customer: <ModuleTranslation key="customer" /></li>
        <li>Sales Summary: <ModuleTranslation key="summary" /></li>
        <li>Today: <ModuleTranslation key="today" /></li>
      </ul>
    </ModuleTranslationProvider>
  </div>
  
  <div class="test-actions">
    <h2>Test Actions</h2>
    <button on:click={() => testValue = 'updated'}>Update Test Value</button>
    <p>Test value: {testValue}</p>
    <p>Current language from store: {currentLang}</p>
  </div>
</div>

<style>
  .test-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .language-controls {
    margin: 2rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
  }
  
  .lang-btn {
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .lang-btn.en {
    background: #007bff;
    color: white;
  }
  
  .lang-btn.fr {
    background: #28a745;
    color: white;
  }
  
  .translation-tests {
    margin: 2rem 0;
  }
  
  .translation-tests ul {
    list-style: none;
    padding: 0;
  }
  
  .translation-tests li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .test-actions {
    margin-top: 2rem;
    padding: 1rem;
    background: #e9ecef;
    border-radius: 0.5rem;
  }
</style>
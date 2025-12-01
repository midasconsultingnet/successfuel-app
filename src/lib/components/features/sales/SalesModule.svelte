<script lang="ts">
  import ModuleTranslationProvider from '$lib/components/ModuleTranslationProvider.svelte';
  import ModuleTranslation from '$lib/components/ModuleTranslation.svelte';
  import { salesEnTranslations, salesFrTranslations } from '$lib/i18n/modules/sales.translations';
  
  // Define the module's translation structure
  const moduleTranslations = {
    en: salesEnTranslations,
    fr: salesFrTranslations
  };
</script>

<ModuleTranslationProvider moduleId="sales" {moduleTranslations}>
  <div class="sales-module">
    <h1><ModuleTranslation key="title" /></h1>
    <p><ModuleTranslation key="summary" /></p>
    
    <div class="sales-actions">
      <button class="btn btn-primary">
        <ModuleTranslation key="newSale" />
      </button>
    </div>
    
    <div class="sales-data">
      <h2><ModuleTranslation key="salesReport" /></h2>
      <div class="time-filters">
        <button><ModuleTranslation key="today" /></button>
        <button><ModuleTranslation key="week" /></button>
        <button><ModuleTranslation key="month" /></button>
        <button><ModuleTranslation key="year" /></button>
      </div>
    </div>
  </div>
</ModuleTranslationProvider>

<style>
  .sales-module {
    padding: 1.5rem;
  }
  
  .sales-actions {
    margin: 1rem 0;
  }
  
  .sales-data {
    margin-top: 2rem;
  }
  
  .time-filters {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .time-filters button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .time-filters button:hover {
    background: #f5f5f5;
  }
</style>
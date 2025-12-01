// Utility to load all module translations
import { translationRegistry } from '$lib/i18n/TranslationRegistry';
import { salesEnTranslations, salesFrTranslations } from '$lib/i18n/modules/sales.translations';
import { enTranslations, frTranslations } from '$lib/i18n/translationData';

// This function loads all available module translations into the registry
export async function loadAllModuleTranslations() {
  // First, make sure core translations are loaded into window for the registry to access
  if (typeof window !== 'undefined') {
    (window as any).__CORE_EN_TRANSLATIONS__ = enTranslations;
    (window as any).__CORE_FR_TRANSLATIONS__ = frTranslations;
  }

  // Register sales module translations
  translationRegistry.registerModuleTranslations('sales', {
    en: salesEnTranslations,
    fr: salesFrTranslations
  });

  // Add more modules as they are created
  // translationRegistry.registerModuleTranslations('inventory', { ... });
  // translationRegistry.registerModuleTranslations('reports', { ... });
  // etc.

  // Initialize the registry
  await translationRegistry.initialize();
}

// Function to dynamically load a module's translations
export async function loadModuleTranslations(moduleId: string) {
  // For now, we'll just return the module if it already exists in registry
  // In the future, this can dynamically import module translations
  const moduleTrans = {
    sales: {
      en: salesEnTranslations,
      fr: salesFrTranslations
    }
  }[moduleId];

  if (moduleTrans) {
    translationRegistry.registerModuleTranslations(moduleId, moduleTrans);
  }
}
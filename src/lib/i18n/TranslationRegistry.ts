import { derived, type Readable } from 'svelte/store';
import type { Language, TranslationKeys } from './i18n';
import { language } from './languageStore';
import { enTranslations, frTranslations } from './translationData';

// Define module-specific translation types
export type ModuleTranslations = Record<string, any>;

// Registry to store all module translations
class TranslationRegistry {
  private moduleTranslations: Map<string, ModuleTranslations> = new Map();
  private isInitialized = false;

  // Register translations for a specific module
  registerModuleTranslations(moduleId: string, translations: ModuleTranslations) {
    this.moduleTranslations.set(moduleId, translations);
  }

  // Get translations for a specific module
  getModuleTranslations(moduleId: string, lang: Language): ModuleTranslations | null {
    const moduleTrans = this.moduleTranslations.get(moduleId);
    if (!moduleTrans) return null;

    return lang === 'fr' ? moduleTrans['fr'] : moduleTrans['en'];
  }

  // Get all translations for a language
  getAllTranslations(lang: Language): TranslationKeys {
    // Import all module translations for the given language
    const allTranslations = { ...this.getCoreTranslations(lang) };
    
    for (const [moduleId, moduleTrans] of this.moduleTranslations.entries()) {
      const moduleLangTrans = this.getModuleTranslations(moduleId, lang);
      if (moduleLangTrans) {
        // Deep merge module translations into the main object
        this.deepMerge(allTranslations, moduleLangTrans);
      }
    }
    
    return allTranslations;
  }

  // Get core translations based on language
  private getCoreTranslations(lang: Language): TranslationKeys {
    if (typeof window !== 'undefined') {
      // Check if translations are already loaded in window
      if (lang === 'fr') {
        return (window as any).__CORE_FR_TRANSLATIONS__ || frTranslations;
      } else {
        return (window as any).__CORE_EN_TRANSLATIONS__ || enTranslations;
      }
    }
    // Fallback to direct values
    return lang === 'fr' ? frTranslations : enTranslations;
  }

  // Deep merge function to merge nested objects
  private deepMerge(target: any, source: any) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  // Initialize registry with default translations
  async initialize() {
    if (this.isInitialized) return;
    
    // This will be called after the language store is available
    this.isInitialized = true;
  }

  // Load core translations dynamically
  async loadCoreTranslations(lang: Language) {
    if (typeof window !== 'undefined') {
      if (lang === 'fr') {
        (window as any).__CORE_FR_TRANSLATIONS__ = frTranslations;
      } else {
        (window as any).__CORE_EN_TRANSLATIONS__ = enTranslations;
      }
    }
  }
}

// Create a singleton instance
export const translationRegistry = new TranslationRegistry();

// Function to register module translations
export function registerModuleTranslations(moduleId: string, translations: ModuleTranslations) {
  translationRegistry.registerModuleTranslations(moduleId, translations);
}

// Import statement to get the current language
import { get } from 'svelte/store';

// Reactive store for current language translations
export const currentTranslations = derived(
  [language],
  ([$language]) => {
    return translationRegistry.getAllTranslations($language);
  }
);

// Function to get translation by key
// This function is for direct use, but for reactive updates in components
// use the translationStore approach
export function getTranslation(key: string, params?: Record<string, any>): string {
  const keys = key.split('.');
  // Access language store directly
  const currentLang = get(language);
  const allTranslations = translationRegistry.getAllTranslations(currentLang);

  let translation: any = allTranslations;
  for (const k of keys) {
    translation = translation?.[k];
  }

  if (translation && params) {
    // Replace placeholders with provided values
    for (const [paramKey, paramValue] of Object.entries(params)) {
      translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }
  }

  return translation || key;
}

// Reactive translation store
export function translationStore(key: string, params?: Record<string, any>): Readable<string> {
  return derived(
    [currentTranslations],
    ([$currentTranslations]) => {
      const keys = key.split('.');
      let translation: any = $currentTranslations;

      for (const k of keys) {
        translation = translation?.[k];
      }

      if (translation && params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
        }
      }

      return translation || key;
    }
  );
}
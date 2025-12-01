// Simple i18n system with reactive updates for Svelte 5
import { translationStore as registryTranslationStore, getTranslation } from './TranslationRegistry';
import { language, setLanguage } from './languageStore';
import { type Language, type TranslationKeys } from './translationData';
import { derived } from 'svelte/store';

// Translation function with parameter support - updated to use registry
export function t(key: keyof TranslationKeys | string, params?: Record<string, any>): string {
  // This function is for direct use, but for reactive updates in components
  // use the translationStore approach
  return getTranslation(key, params);
}

// Reactive translation store - this creates a proper reactive dependency
export function translationStore(key: string, params?: Record<string, any>) {
  return registryTranslationStore(key, params);
}

// Helper for replacing variables in translations
export function format(str: string, params?: Record<string, any>): string {
  if (!params) return str;

  let formatted = str;
  for (const [key, value] of Object.entries(params)) {
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return formatted;
}

// We'll also create a reactive translation function
import { get } from 'svelte/store';
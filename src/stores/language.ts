import { writable } from 'svelte/store';
import {
  setLanguage as newSetLanguage,
  type Language,
  t
} from '$lib/i18n/i18n';
import { language as langStore } from '$lib/i18n/languageStore';

// Get the current language from storage
function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && (storedLang === 'en' || storedLang === 'fr')) {
      return storedLang;
    }

    // Try to detect browser language
    const browserLang = navigator.language.slice(0, 2) as Language;
    if (browserLang === 'en' || browserLang === 'fr') {
      return browserLang;
    }
  }

  // Default to English
  return 'en';
}

// Create a writable store for language that connects with the new system
const createLanguageStore = () => {
  const { subscribe, set, update } = writable<Language>(getCurrentLanguage());

  // Subscribe to the main language store to keep in sync
  const unsubscribe = langStore.subscribe(value => {
    set(value);
  });

  return {
    subscribe,
    set: (lang: Language) => {
      // Update the main language store which will propagate to the rest of the app
      newSetLanguage(lang);
    },
    toggle: () => {
      update(current => {
        const nextLang = current === 'en' ? 'fr' : 'en';
        newSetLanguage(nextLang);
        return nextLang;
      });
    },
    t: (key: string) => t(key),
    current: getCurrentLanguage
  };
};

export const language = createLanguageStore();
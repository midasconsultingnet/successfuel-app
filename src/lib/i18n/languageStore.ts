import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Language } from './i18n';

// Current language store - this should be imported before anything else
export const language = writable<Language>(
  (typeof window !== 'undefined' && localStorage.getItem('language')) as Language ||
  (browser && navigator.language.startsWith('fr') ? 'fr' : 'en')
);

// Keep language in sync with localStorage
language.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', value);
  }
});

// Language switching function
export function setLanguage(lang: Language) {
  console.log("Setting language to:", lang); // Debug log
  language.set(lang);
}
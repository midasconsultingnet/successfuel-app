import { setContext, getContext } from 'svelte';
import { writable, derived, type Writable, get } from 'svelte/store';
import { language, type Language, setLanguage } from '$lib/i18n/languageStore';
import { getTranslation } from '$lib/i18n/TranslationRegistry';

// Définition du type pour le contexte i18n
export type I18nContext = {
  lang: Writable<Language>;
  t: (key: string, params?: Record<string, any>) => string;
  setLanguage: (lang: Language) => void;
};

// Clé unique pour le contexte
const I18N_CONTEXT_KEY = Symbol('i18n');

// Fonction pour initialiser le contexte
export function initI18nContext(): I18nContext {
  const lang = writable<Language>(get(language));

  // S'abonner aux changements de langue
  const unsubscribe = language.subscribe(value => {
    lang.set(value);
  });

  const context: I18nContext = {
    lang,
    t: getTranslation,
    setLanguage
  };

  setContext(I18N_CONTEXT_KEY, context);
  return context;
}

// Fonction pour récupérer le contexte
export function useI18n(): I18nContext {
  return getContext<I18nContext>(I18N_CONTEXT_KEY);
}

// Fonction utilitaire pour créer des traductions réactives
export function createReactiveTranslationStore(key: string, params?: Record<string, any>) {
  const { lang } = useI18n();

  return derived(
    [lang],
    ([$lang]) => {
      return getTranslation(key, params);
    }
  );
}
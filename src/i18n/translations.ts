import { en } from './locales/en';
import { id } from './locales/id';

export type Language = 'en' | 'id';

export const translations = {
  en,
  id,
} as const;

export type TranslationKey = keyof typeof translations.en;

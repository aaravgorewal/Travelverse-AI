import { create } from "zustand";
import { TRANSLATIONS, LanguageCode } from "../config/translations";

interface I18nState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  language: (localStorage.getItem("travelverse_lang") as LanguageCode) || "en",

  setLanguage: (language) => {
    localStorage.setItem("travelverse_lang", language);
    set({ language });
  },

  t: (key) => {
    const lang = get().language;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  }
}));

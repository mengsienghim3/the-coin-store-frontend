"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Language, translations, Translations } from "../lib/i18n";
import enMessages from "../messages/en.json";
import kmMessages from "../messages/km.json";

const messagesRecord = {
  en: enMessages,
  km: kmMessages,
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("the_coin_store_lang") as Language;
    if (saved === "en" || saved === "km") {
      setLangState(saved);
      document.cookie = `NEXT_LOCALE=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("the_coin_store_lang", newLang);
      document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLang;
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "km" : "en");
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      <NextIntlClientProvider
        locale={lang}
        messages={messagesRecord[lang]}
        timeZone="Asia/Phnom_Penh"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default fallback if used outside provider (safe for SSR or unit tests)
    return {
      lang: "en" as Language,
      setLang: () => {},
      toggleLang: () => {},
      t: translations.en,
    };
  }
  return context;
}

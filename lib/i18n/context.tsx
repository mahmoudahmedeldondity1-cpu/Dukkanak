"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ar, TranslationDict } from "./ar";
import { en } from "./en";

export type Locale = "ar" | "en";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationDict;
  dir: "rtl" | "ltr";
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "ar",
  setLocale: () => {},
  t: ar,
  dir: "rtl",
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dukkanak_locale") as Locale | null;
      if (saved === "ar" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {
      // Ignore localStorage read failures
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("dukkanak_locale", l);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale]);

  const t = locale === "en" ? en : ar;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

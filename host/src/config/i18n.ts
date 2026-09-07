import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEs from "@/locales/es/common.json";
import commonEn from "@/locales/en/common.json";

/**
 * Configuraciones generales de internacionalización (i18n).
 */
export const i18nConfig = {
  /** Idioma por defecto de la aplicación */
  defaultLocale: "es",

  /** Lista de idiomas soportados */
  supportedLocales: ["es", "en"] as const,

  /** Clave de almacenamiento local para persistir el idioma del usuario */
  storageKey: "app_locale",

  /** Namespace por defecto */
  defaultNamespace: "common",
};

export type Locale = (typeof i18nConfig.supportedLocales)[number];

// Evitar doble inicialización en arquitecturas federadas
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: i18nConfig.defaultLocale,
      supportedLngs: [...i18nConfig.supportedLocales],
      defaultNS: i18nConfig.defaultNamespace,
      resources: {
        es: {
          common: commonEs,
        },
        en: {
          common: commonEn,
        },
      },
      interpolation: {
        escapeValue: false, // React ya se encarga de escapar valores contra XSS
      },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: i18nConfig.storageKey,
        caches: ["localStorage"],
      },
      react: {
        useSuspense: false, // Permite renderizar de inmediato con recursos síncronos en memoria
      },
    });
}

export default i18n;

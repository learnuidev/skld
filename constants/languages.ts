export type LanguageCode = "en-US" | "zh-CN" | "es" | "fr" | "ar";

export interface SupportedLanguage {
  id: LanguageCode;
  title: string;
  languageDirection: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "en-US",
    title: "English",
    languageDirection: "ltr",
  },
  {
    id: "zh-CN",
    title: "Simplified Chinese",
    languageDirection: "ltr",
  },
  {
    id: "es",
    title: "Spanish",
    languageDirection: "ltr",
  },
  {
    id: "fr",
    title: "French",
    languageDirection: "ltr",
  },
  {
    id: "ar",
    title: "Arabic",
    languageDirection: "rtl",
  },
];

"use client";

import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

interface LanguageSelectorProps {
  variant?: "dropdown" | "compact";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = "dropdown",
  showLabel = true,
  className = "",
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-500" />
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto">
            <SelectValue>
              <span className="flex items-center gap-1">
                <span>{currentLanguage.flag}</span>
                <span className="text-sm">
                  {currentLanguage.code.toUpperCase()}
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span>{language.flag}</span>
                  <span>{language.nativeName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Language:</span>
        </div>
      )}
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.nativeName}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.nativeName}</span>
                <span className="text-gray-500 text-sm">({language.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

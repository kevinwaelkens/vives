"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "dropdown" | "select";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = "dropdown",
  showLabel = true,
  className = "",
}: LanguageSelectorProps) {
  const { currentLanguage, availableLanguages, setLanguage, isLoading } =
    useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !currentLanguage) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-400" />
        {showLabel && <span className="text-sm text-gray-400">Loading...</span>}
      </div>
    );
  }

  if (variant === "select") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Language:</span>
          </div>
        )}
        <Select value={currentLanguage.code} onValueChange={setLanguage}>
          <SelectTrigger className="w-auto min-w-32">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.nativeName}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((language) => (
              <SelectItem key={language.id} value={language.code}>
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
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100"
      >
        <Globe className="h-4 w-4" />
        {showLabel && (
          <>
            <span className="hidden sm:inline">
              {currentLanguage.nativeName}
            </span>
            <span className="sm:hidden">{currentLanguage.flag}</span>
          </>
        )}
        {!showLabel && <span>{currentLanguage.flag}</span>}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-10 bg-transparent border-none cursor-default"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            aria-label="Close language selector"
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg min-w-48">
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => {
                    setLanguage(language.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 ${
                    currentLanguage.code === language.code
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {currentLanguage.code === language.code && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

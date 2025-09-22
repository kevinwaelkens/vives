"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Languages,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  Globe,
  Key,
  Folder,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useTranslationInvalidation } from "@/lib/i18n/translation-provider";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isActive: boolean;
  isDefault: boolean;
}

interface TranslationKey {
  id: string;
  key: string;
  englishText: string;
  description?: string;
  category?: string;
  translations: Translation[];
}

interface Translation {
  id: string;
  text: string;
  isApproved: boolean;
  language: Language;
}

export default function CMSTranslationsPage() {
  const { t } = useTranslation("cms");
  const { onTranslationKeyUpdated } = useTranslationInvalidation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Dialog states
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [editingKey, setEditingKey] = useState<TranslationKey | null>(null);
  const [editingTranslation, setEditingTranslation] = useState<{
    keyId: string;
    translation?: Translation;
    languageId: string;
  } | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<TranslationKey | null>(null);

  const [keyFormData, setKeyFormData] = useState({
    key: "",
    englishText: "",
    description: "",
    category: "",
  });

  const [translationFormData, setTranslationFormData] = useState({
    text: "",
    isApproved: false,
  });

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch("/api/translations/languages");
      if (response.ok) {
        const data = await response.json();
        setLanguages(data);
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  }, []);

  const fetchTranslationKeys = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      // Fetch all translation keys by setting a large pageSize
      params.append("pageSize", "1000");

      const response = await fetch(`/api/translations/keys?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTranslationKeys(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch translation keys:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  // Fetch data
  useEffect(() => {
    fetchLanguages();
    fetchTranslationKeys();
  }, [fetchLanguages, fetchTranslationKeys]);

  // Refetch when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTranslationKeys();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchTranslationKeys]);

  // Get unique categories
  const categories = Array.from(
    new Set(translationKeys.map((key) => key.category).filter((cat): cat is string => Boolean(cat))),
  );

  // Filter and sort translation keys
  const filteredKeys = translationKeys
    .filter((key) => {
      const matchesSearch =
        !searchTerm ||
        key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.englishText.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "__all__" ||
        key.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by category first, then by key
      if (a.category !== b.category) {
        return (a.category || "").localeCompare(b.category || "");
      }
      return a.key.localeCompare(b.key);
    });

  // Handle key form
  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingKey
        ? `/api/translations/keys/${editingKey.id}`
        : "/api/translations/keys";

      const method = editingKey ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keyFormData),
      });

      if (response.ok) {
        await fetchTranslationKeys();
        setIsKeyDialogOpen(false);
        resetKeyForm();
        // Invalidate translation cache for the category
        onTranslationKeyUpdated(keyFormData.category);
      }
    } catch (error) {
      console.error("Failed to save translation key:", error);
    }
  };

  // Handle translation form
  const handleTranslationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTranslation) return;

    try {
      if (editingTranslation.translation) {
        // Update existing translation
        const response = await fetch(
          `/api/translations/translations/${editingTranslation.translation.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(translationFormData),
          },
        );

        if (response.ok) {
          await fetchTranslationKeys();
          setIsTranslationDialogOpen(false);
          resetTranslationForm();
          // Invalidate translation cache for the key's category
          const translationKey = translationKeys.find(
            (k) => k.id === editingTranslation.keyId,
          );
          await onTranslationKeyUpdated(translationKey?.category);
        }
      } else {
        // Create new translation
        const response = await fetch(
          `/api/translations/keys/${editingTranslation.keyId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...translationFormData,
              languageId: editingTranslation.languageId,
            }),
          },
        );

        if (response.ok) {
          await fetchTranslationKeys();
          setIsTranslationDialogOpen(false);
          resetTranslationForm();
          // Invalidate translation cache for the key's category
          const translationKey = translationKeys.find(
            (k) => k.id === editingTranslation.keyId,
          );
          onTranslationKeyUpdated(translationKey?.category);
        }
      }
    } catch (error) {
      console.error("Failed to save translation:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!keyToDelete) return;

    try {
      const response = await fetch(`/api/translations/keys/${keyToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTranslationKeys();
        setIsDeleteDialogOpen(false);
        // Invalidate translation cache for the deleted key's category
        onTranslationKeyUpdated(keyToDelete.category);
        setKeyToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete translation key:", error);
    }
  };

  // Form helpers
  const resetKeyForm = () => {
    setKeyFormData({ key: "", englishText: "", description: "", category: "" });
    setEditingKey(null);
  };

  const resetTranslationForm = () => {
    setTranslationFormData({ text: "", isApproved: false });
    setEditingTranslation(null);
  };

  const openKeyDialog = (key?: TranslationKey) => {
    if (key) {
      setEditingKey(key);
      setKeyFormData({
        key: key.key,
        englishText: key.englishText,
        description: key.description || "",
        category: key.category || "",
      });
    } else {
      resetKeyForm();
    }
    setIsKeyDialogOpen(true);
  };

  const openTranslationDialog = (
    keyId: string,
    languageId: string,
    translation?: Translation,
  ) => {
    setEditingTranslation({ keyId, languageId, translation });
    setTranslationFormData({
      text: translation?.text || "",
      isApproved: translation?.isApproved || false,
    });
    setIsTranslationDialogOpen(true);
  };

  const openDeleteDialog = (key: TranslationKey) => {
    setKeyToDelete(key);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="h-6 w-6" />
            {t("translations")}
          </h1>
          <p className="text-gray-600">
            Manage translation keys and translations for all supported languages
          </p>
        </div>
        {/* Currently we don't need to allow this as dynamic content can't be used either */}
        {/* <Button
          onClick={() => openKeyDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Translation Key
        </Button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages.length}</div>
            <p className="text-xs text-muted-foreground">
              {languages.filter((l) => l.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Translation Keys
            </CardTitle>
            <Key className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Translations
            </CardTitle>
            <Languages className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {translationKeys.reduce(
                (sum, key) => sum + key.translations.length,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all languages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Check className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {translationKeys.length > 0
                ? Math.round(
                    (translationKeys.reduce(
                      (sum, key) => sum + key.translations.length,
                      0,
                    ) /
                      (translationKeys.length * languages.length)) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search translation keys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Translation Keys by Category */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">Loading...</CardContent>
        </Card>
      ) : filteredKeys.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No translation keys found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Group keys by category */}
          {(() => {
            // Group filtered keys by category
            const keysByCategory = filteredKeys.reduce(
              (acc, key) => {
                const category = key.category || "Uncategorized";
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(key);
                return acc;
              },
              {} as Record<string, typeof filteredKeys>,
            );

            return Object.entries(keysByCategory).map(([category, keys]) => (
              <CollapsibleCard
                key={category}
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                icon={<Folder className="h-5 w-5" />}
                badge={<Badge variant="secondary">{keys.length}</Badge>}
                defaultOpen={true}
                previewContent={`${keys.length} translation keys`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">Key</th>
                        <th className="text-left p-3 font-medium">English</th>
                        {languages.map((language) => (
                          <th
                            key={language.id}
                            className="text-center p-3 font-medium w-20"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg">{language.flag}</span>
                              <span className="text-xs text-gray-600">
                                {language.code.toUpperCase()}
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="text-center p-3 font-medium w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((key) => (
                        <tr key={key.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                  {key.key}
                                </code>
                              </div>
                              {key.description && (
                                <p className="text-xs text-gray-500 max-w-xs">
                                  {key.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <p className="text-sm max-w-xs">
                              {key.englishText}
                            </p>
                          </td>
                          {languages.map((language) => {
                            const translation = key.translations.find(
                              (t) => t.language.id === language.id,
                            );

                            return (
                              <td
                                key={language.id}
                                className="p-3 align-top text-center"
                              >
                                {translation ? (
                                  <div className="space-y-1">
                                    <button
                                      type="button"
                                      className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded max-w-32 mx-auto truncate bg-transparent border-none"
                                      onClick={() =>
                                        openTranslationDialog(
                                          key.id,
                                          language.id,
                                          translation,
                                        )
                                      }
                                      title={translation.text}
                                    >
                                      {translation.text}
                                    </button>
                                    {translation.isApproved && (
                                      <Check className="h-3 w-3 text-green-500 mx-auto" />
                                    )}
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                    onClick={() =>
                                      openTranslationDialog(key.id, language.id)
                                    }
                                    title="Add translation"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3 align-top">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => openKeyDialog(key)}
                                title="Edit key"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                onClick={() => openDeleteDialog(key)}
                                title="Delete key"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CollapsibleCard>
            ));
          })()}
        </div>
      )}

      {/* Key Dialog */}
      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingKey ? "Edit Translation Key" : "Add Translation Key"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                value={keyFormData.key}
                onChange={(e) =>
                  setKeyFormData({ ...keyFormData, key: e.target.value })
                }
                placeholder="e.g., auth.login.title"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use dot notation (e.g., category.section.item)
              </p>
            </div>
            <div>
              <Label htmlFor="englishText">English Text *</Label>
              <Input
                id="englishText"
                value={keyFormData.englishText}
                onChange={(e) =>
                  setKeyFormData({
                    ...keyFormData,
                    englishText: e.target.value,
                  })
                }
                placeholder="e.g., Login"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={keyFormData.category}
                onChange={(e) =>
                  setKeyFormData({ ...keyFormData, category: e.target.value })
                }
                placeholder="e.g., auth, navigation, common"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={keyFormData.description}
                onChange={(e) =>
                  setKeyFormData({
                    ...keyFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Context for translators..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsKeyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingKey ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Translation Dialog */}
      <Dialog
        open={isTranslationDialogOpen}
        onOpenChange={setIsTranslationDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation?.translation
                ? "Edit Translation"
                : "Add Translation"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTranslationSubmit} className="space-y-4">
            {editingTranslation && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Key:</strong>{" "}
                  {
                    translationKeys.find(
                      (k) => k.id === editingTranslation.keyId,
                    )?.key
                  }
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>English:</strong>{" "}
                  {
                    translationKeys.find(
                      (k) => k.id === editingTranslation.keyId,
                    )?.englishText
                  }
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Language:</strong>{" "}
                  {
                    languages.find(
                      (l) => l.id === editingTranslation.languageId,
                    )?.nativeName
                  }
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="text">Translation *</Label>
              <Textarea
                id="text"
                value={translationFormData.text}
                onChange={(e) =>
                  setTranslationFormData({
                    ...translationFormData,
                    text: e.target.value,
                  })
                }
                placeholder="Enter translation..."
                required
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isApproved"
                checked={translationFormData.isApproved}
                onChange={(e) =>
                  setTranslationFormData({
                    ...translationFormData,
                    isApproved: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="isApproved">Mark as approved</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTranslationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTranslation?.translation ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Translation Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the translation key "
              {keyToDelete?.key}"? This will also delete all translations for
              this key. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

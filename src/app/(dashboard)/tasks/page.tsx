"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Calendar,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useTasks, useCreateTask, useDeleteTask } from "@/data/hooks/use-tasks";
import { useGroups } from "@/data/hooks/use-groups";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { TranslationLoading } from "@/components/ui/translation-loading";

function TasksPageContent() {
  const { t, isLoading: translationsLoading } = useTranslation("tasks", {
    useDynamic: true,
  });
  const { t: tCommon } = useTranslation("common", { useDynamic: true });
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get("highlight");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    type: "ASSIGNMENT",
    category: "",
    points: 100,
    dueDate: "",
    groupIds: [] as string[],
    isPublished: false,
  });

  const { data: tasksData, isLoading } = useTasks();
  const { data: groupsData } = useGroups();
  const createMutation = useCreateTask();
  const deleteMutation = useDeleteTask();

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      type: "ASSIGNMENT",
      category: "",
      points: 100,
      dueDate: "",
      groupIds: [],
      isPublished: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...formData,
      type: formData.type as
        | "ASSIGNMENT"
        | "QUIZ"
        | "EXAM"
        | "PROJECT"
        | "HOMEWORK",
      dueDate: new Date(formData.dueDate), // Convert string to Date
    });
    setShowAddForm(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("delete_confirmation"))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.data || [];

  // Scroll to highlighted task
  useEffect(() => {
    if (highlightTaskId && tasks.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`task-${highlightTaskId}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500); // Small delay to ensure rendering is complete

      return () => clearTimeout(timer);
    }
  }, [highlightTaskId, tasks]);
  const groups = groupsData || [];

  // Show loading skeleton while translations are loading
  if (translationsLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
  }

  return (
    <TranslationLoading isLoading={translationsLoading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 mt-1">{t("subtitle")}</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("create_task")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("stats.total_tasks")}
                  </p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("stats.published")}
                  </p>
                  <p className="text-2xl font-bold">
                    {tasks.filter((t) => t.isPublished).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.drafts")}</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter((t) => !t.isPublished).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("stats.due_this_week")}
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      tasks.filter((t) => {
                        if (!t.dueDate) return false;
                        const due = new Date(t.dueDate);
                        const now = new Date();
                        const weekFromNow = new Date(
                          now.getTime() + 7 * 24 * 60 * 60 * 1000,
                        );
                        return due >= now && due <= weekFromNow;
                      }).length
                    }
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>{t("form.create_new_task")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">{t("form.title_label")}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">{t("form.type_label")}</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ASSIGNMENT">
                        {t("types.assignment")}
                      </option>
                      <option value="QUIZ">{t("types.quiz")}</option>
                      <option value="EXAM">{t("types.exam")}</option>
                      <option value="PROJECT">{t("types.project")}</option>
                      <option value="HOMEWORK">{t("types.homework")}</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g., Mathematics, Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          points: parseInt(e.target.value),
                        })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="groups">Groups</Label>
                    <select
                      id="groups"
                      multiple
                      value={formData.groupIds}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        );
                        setFormData({ ...formData, groupIds: selectedOptions });
                      }}
                      className="w-full h-24 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.academicYear} - Grade{" "}
                          {group.grade})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple groups
                    </p>
                  </div>
                  <div>
                    <Label>Publish Status</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublished: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isPublished" className="font-normal">
                        Publish immediately
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full h-24 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    className="w-full h-24 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed instructions for students"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{t("create_task")}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                  >
                    {tCommon("cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <Card
              key={task.id}
              id={`task-${task.id}`}
              className={`hover:shadow-lg transition-shadow ${highlightTaskId === task.id ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link href={`/tasks/${task.id}`}>
                      <CardTitle className="text-lg hover:text-blue-600 cursor-pointer transition-colors">
                        {task.title}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.type === "EXAM"
                            ? "bg-red-100 text-red-700"
                            : task.type === "QUIZ"
                              ? "bg-yellow-100 text-yellow-700"
                              : task.type === "PROJECT"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {task.type}
                      </span>
                      {task.category && (
                        <span className="text-sm text-gray-500">
                          {task.category}
                        </span>
                      )}
                      {task.isPublished ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Published
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Draft</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {task.description}
                </p>
                <div className="space-y-2 text-sm">
                  {task.points && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Points:</span>
                      <span>{task.points}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{task.groups.length} Groups Assigned</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{task._count.assessments} Submissions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t("no_tasks")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </TranslationLoading>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  );
}

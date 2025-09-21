"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  useGroups,
  useCreateGroup,
  useDeleteGroup,
} from "@/data/hooks/use-groups";
import { useTranslation } from "@/lib/i18n";
import { useSession } from "next-auth/react";

export default function GroupsPage() {
  const { t } = useTranslation("groups");
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    academicYear: "2024",
    grade: "",
  });

  const { data: groups, isLoading } = useGroups();
  const createMutation = useCreateGroup();
  const deleteMutation = useDeleteGroup();

  // Check if current user is admin
  const isAdmin = session?.user?.role === "ADMIN";
  const isTutor = session?.user?.role === "TUTOR";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setShowAddForm(false);
    setFormData({ name: "", code: "", academicYear: "2024", grade: "" });
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        t("delete_confirmation") ||
          "Are you sure you want to delete this group?",
      )
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? t("subtitle")
              : isTutor
                ? t("subtitle_tutor")
                : t("subtitle_viewer")}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("create_group")}
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Class 10A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Group Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., CLS10A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                    placeholder="e.g., 2024"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Group</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      name: "",
                      code: "",
                      academicYear: "2024",
                      grade: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups?.map((group) => (
          <Card
            key={group.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              window.location.href = `/groups/${group.id}`;
            }}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Code: {group.code}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/groups/${group.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="sm" variant="ghost" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            name: group.name,
                            code: group.code,
                            academicYear: group.academicYear,
                            grade: group.grade,
                          });
                          setShowAddForm(true);
                        }}
                        title="Edit Group"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(group.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Academic Year: {group.academicYear}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Grade: {group.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {(group as any)._count?.students || 0} Students
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active Tasks:</span>
                    <span className="font-medium">
                      {(group as any)._count?.tasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Tutors:</span>
                    <span className="font-medium">
                      {(group as any).tutors?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isTutor ? (
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">
                  {t("empty_state.tutor_title")}
                </p>
                <p className="text-gray-500">
                  {t("empty_state.tutor_description")}
                </p>
              </div>
            ) : isAdmin ? (
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">
                  {t("empty_state.admin_title")}
                </p>
                <p className="text-gray-500">
                  {t("empty_state.admin_description")}
                </p>
                <Button onClick={() => setShowAddForm(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("create_first_group")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">
                  {t("empty_state.viewer_title")}
                </p>
                <p className="text-gray-500">
                  {t("empty_state.viewer_description")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

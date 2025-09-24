"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  BookOpen,
  Edit2,
  Plus,
  ArrowLeft,
  UserMinus,
  ArrowRight,
  Mail,
  Phone,
  GraduationCap,
  Clock,
} from "lucide-react";
import { useGroup, useGroups } from "@/data/hooks/use-groups";
import { groupsApi } from "@/data/api/groups";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { useTranslation } from "@/lib/i18n";
import { TranslationLoading } from "@/components/ui/translation-loading";
import { useEffect } from "react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const { data: group, isLoading, refetch, error } = useGroup(groupId);
  const { data: allGroups } = useGroups();
  const { setTitle } = usePageTitle();
  const { t, isLoading: translationsLoading } = useTranslation("groups", {
    useDynamic: true,
  });

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMoveStudentDialog, setShowMoveStudentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [targetGroup, setTargetGroup] = useState<string>("");
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    academicYear: "",
    grade: "",
  });

  // Initialize edit form and set page title when group data loads
  useEffect(() => {
    if (group) {
      setEditForm({
        name: group.name,
        code: group.code,
        academicYear: group.academicYear,
        grade: group.grade,
      });
      setTitle(group.name);
    }
  }, [group, setTitle]);

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupsApi.updateGroup(groupId, editForm);
      alert("Group updated successfully");
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      alert("Failed to update group");
      console.error("Error updating group:", error);
    }
  };

  const handleMoveStudent = async () => {
    if (!selectedStudent || !targetGroup) return;

    try {
      await groupsApi.moveStudentToGroup(targetGroup, selectedStudent);
      alert("Student moved successfully");
      setShowMoveStudentDialog(false);
      setSelectedStudent("");
      setTargetGroup("");
      refetch();
    } catch (error) {
      alert("Failed to move student");
      console.error("Error moving student:", error);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await groupsApi.removeStudentFromGroup(groupId, studentId);
      alert("Student removed successfully");
      refetch();
    } catch (error) {
      alert("Failed to remove student");
      console.error("Error removing student:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t("detail.loading")}</div>
      </div>
    );
  }

  if (error) {
    console.error("Group fetch error:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("detail.error_loading")}
          </h2>
          <p className="text-gray-500 mb-4">
            {error instanceof Error ? error.message : t("detail.error_loading")}
          </p>
          <Button onClick={() => router.push("/groups")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.back_to_groups")}
          </Button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("detail.not_found")}
          </h2>
          <p className="text-gray-500 mb-4">
            {t("detail.not_found_description")}
          </p>
          <Button onClick={() => router.push("/groups")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.back_to_groups")}
          </Button>
        </div>
      </div>
    );
  }

  // Filter available target groups (not current group)
  const availableGroups = allGroups?.filter((g) => g.id !== groupId) || [];

  return (
    <TranslationLoading isLoading={translationsLoading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/groups")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-500">
                {group.code} • {group.academicYear} • Grade {group.grade}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t("detail.edit_group")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("detail.edit_dialog.title")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {t("detail.edit_dialog.group_name")}
                    </Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">
                      {t("detail.edit_dialog.group_code")}
                    </Label>
                    <Input
                      id="code"
                      value={editForm.code}
                      onChange={(e) =>
                        setEditForm({ ...editForm, code: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="academicYear">
                      {t("detail.edit_dialog.academic_year")}
                    </Label>
                    <Input
                      id="academicYear"
                      value={editForm.academicYear}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          academicYear: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">
                      {t("detail.edit_dialog.grade")}
                    </Label>
                    <Input
                      id="grade"
                      value={editForm.grade}
                      onChange={(e) =>
                        setEditForm({ ...editForm, grade: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
                    >
                      {t("detail.cancel")}
                    </Button>
                    <Button type="submit">{t("detail.save_changes")}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.total_students")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(group as any)._count?.students || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.active_tasks")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(group as any)._count?.tasks || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.tutors")}
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group.tutors.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {group.tutors.map((tutor) => tutor.name).join(", ")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Section */}
        <CollapsibleCard
          title={t("detail.students")}
          icon={<Users className="h-5 w-5" />}
          badge={<Badge variant="secondary">{group.students.length}</Badge>}
          defaultOpen={true}
          previewContent={
            group.students.length > 0
              ? `${group.students
                  .slice(0, 3)
                  .map((s) => s.name)
                  .join(", ")}${group.students.length > 3 ? "..." : ""}`
              : t("detail.no_students")
          }
        >
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Dialog
                open={showMoveStudentDialog}
                onOpenChange={setShowMoveStudentDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {t("detail.move_student")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("detail.move_student_dialog.title")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>
                        {t("detail.move_student_dialog.select_student")}
                      </Label>
                      <Select
                        value={selectedStudent}
                        onValueChange={setSelectedStudent}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "detail.move_student_dialog.choose_student",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {group.students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>
                        {t("detail.move_student_dialog.target_group")}
                      </Label>
                      <Select
                        value={targetGroup}
                        onValueChange={setTargetGroup}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "detail.move_student_dialog.choose_target_group",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGroups.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.name} ({g.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowMoveStudentDialog(false)}
                      >
                        {t("detail.cancel")}
                      </Button>
                      <Button
                        onClick={handleMoveStudent}
                        disabled={!selectedStudent || !targetGroup}
                      >
                        {t("detail.move_student_dialog.move_button")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                onClick={() => router.push(`/students?groupId=${groupId}`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("detail.add_student")}
              </Button>
            </div>

            {group.students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("detail.no_students")}</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push(`/students?groupId=${groupId}`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("detail.add_first_student")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.students.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          ID: {student.studentId}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        {(student as any).parentContacts?.[0] && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Phone className="h-3 w-3" />
                            {(student as any).parentContacts[0].name}
                          </div>
                        )}
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">
                            {(student as any)._count?.assessments || 0}{" "}
                            {t("detail.stats.assessments")}
                          </Badge>
                          <Badge variant="outline">
                            {(student as any)._count?.attendance || 0}{" "}
                            {t("detail.stats.attendance")}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/students/${student.id}`)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("detail.remove_student_dialog.title")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("detail.remove_student_dialog.description", {
                                  name: student.name,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("detail.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveStudent(student.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t(
                                  "detail.remove_student_dialog.remove_button",
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* Tasks Section */}
        <CollapsibleCard
          title={t("detail.recent_tasks")}
          icon={<BookOpen className="h-5 w-5" />}
          badge={<Badge variant="secondary">{group.tasks?.length || 0}</Badge>}
          defaultOpen={false}
          previewContent={
            group.tasks && group.tasks.length > 0
              ? `${group.tasks
                  .slice(0, 2)
                  .map((t) => t.title)
                  .join(", ")}${group.tasks.length > 2 ? "..." : ""}`
              : t("detail.no_tasks")
          }
        >
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => router.push(`/tasks?groupId=${groupId}`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("detail.create_task")}
              </Button>
            </div>

            {!group.tasks || group.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("detail.no_tasks")}</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push(`/tasks?groupId=${groupId}`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("detail.create_first_task")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {group.tasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.dueDate
                              ? t("detail.task_info.due_date", {
                                  date: new Date(
                                    task.dueDate,
                                  ).toLocaleDateString(),
                                })
                              : t("detail.task_info.no_due_date")}
                          </div>
                          <Badge variant="secondary">
                            {task.type.toLowerCase()}
                          </Badge>
                          <Badge variant="outline">
                            {(task as any)._count?.assessments || 0}{" "}
                            {t("detail.stats.submissions")}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {group.tasks.length >= 10 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/tasks?groupId=${groupId}`)}
                    >
                      {t("detail.view_all_tasks")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleCard>
      </div>
    </TranslationLoading>
  );
}

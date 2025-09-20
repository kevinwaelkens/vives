import { useState, useCallback } from "react";
import { useCreateUser, useUpdateUser } from "@/data/hooks/use-users";
import type { User, UserFormData, UserUpdateData } from "@/data/api/users";

const initialFormData: Partial<UserFormData> = {
  name: "",
  email: "",
  password: "",
  role: "TUTOR",
};

export function useUserForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] =
    useState<Partial<UserFormData>>(initialFormData);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingUser(null);
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setShowDialog(true);
  }, [resetForm]);

  const openEditDialog = useCallback((user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't populate password for security
      role: user.role,
    });
    setShowDialog(true);
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setEditingUser(null);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (editingUser) {
          const updateData: UserUpdateData = {};
          if (formData.name) updateData.name = formData.name;
          if (formData.email) updateData.email = formData.email;
          if (formData.password) updateData.password = formData.password;
          if (formData.role) updateData.role = formData.role;

          await updateMutation.mutateAsync({
            id: editingUser.id,
            data: updateData,
          });
        } else {
          await createMutation.mutateAsync(formData as UserFormData);
        }

        closeDialog();
      } catch (error) {
        // Error handling is done in the mutation hooks
        console.error("Form submission error:", error);
      }
    },
    [editingUser, formData, updateMutation, createMutation, closeDialog],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    showDialog,
    editingUser,
    formData,
    setFormData,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSubmit,
    isSubmitting,
  };
}

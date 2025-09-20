import { useCallback } from "react";
import { useDeleteUser } from "@/data/hooks/use-users";
import type { User } from "@/data/api/users";

export function useUserActions() {
  const deleteMutation = useDeleteUser();

  const handleDeleteUser = useCallback(
    async (user: User) => {
      try {
        await deleteMutation.mutateAsync(user.id);
      } catch (error) {
        // Error handling is done in the mutation hook
        console.error("Delete user error:", error);
      }
    },
    [deleteMutation],
  );

  return {
    handleDeleteUser,
    isDeletingUser: deleteMutation.isPending,
  };
}

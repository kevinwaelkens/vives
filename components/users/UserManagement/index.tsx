"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUsers } from "@/data/hooks/use-users";
import { useUserFilters } from "@/hooks/users/useUserFilters";
import { useUserForm } from "@/hooks/users/useUserForm";
import { useUserActions } from "@/hooks/users/useUserActions";
import { UserFilters } from "../UserFilters";
import { UserList } from "../UserList";
import { UserForm } from "../UserForm";

export function UserManagement() {
  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filterParams,
    hasActiveFilters,
  } = useUserFilters();

  const {
    showDialog,
    editingUser,
    formData,
    setFormData,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSubmit,
    isSubmitting,
  } = useUserForm();

  const { handleDeleteUser } = useUserActions();

  const { data, isLoading } = useUsers(filterParams);

  // Memoize users to prevent unnecessary re-renders
  const users = useMemo(() => data?.data || [], [data?.data]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-0.5">
            Manage system users and their roles
          </p>
        </div>
        <Button onClick={openCreateDialog} data-testid="add-user-button">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {/* Users List */}
      <UserList
        users={users}
        isLoading={isLoading}
        hasFilters={hasActiveFilters}
        onEditUser={openEditDialog}
        onDeleteUser={handleDeleteUser}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="text-sm text-gray-500">
            Showing {users.length} of {data.total} users
          </div>
        </div>
      )}

      {/* User Form Dialog */}
      <UserForm
        isOpen={showDialog}
        onClose={closeDialog}
        editingUser={editingUser}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserX } from "lucide-react";
import { UserCard } from "../UserCard";
import type { User } from "@/data/api/users";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  hasFilters: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UserList = memo(function UserList({
  users,
  isLoading,
  hasFilters,
  onEditUser,
  onDeleteUser,
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            {hasFilters
              ? "Try adjusting your filters"
              : "Get started by adding a new user"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEditUser}
          onDelete={onDeleteUser}
        />
      ))}
    </div>
  );
});

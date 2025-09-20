"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit2,
  Trash2,
  Mail,
  Calendar,
  Shield,
  Eye,
  Users,
  UserCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { User } from "@/data/api/users";

const roleIcons = {
  ADMIN: Shield,
  TUTOR: Users,
  VIEWER: Eye,
  PARENT: UserCheck,
};

const roleColors = {
  ADMIN: "bg-red-100 text-red-800",
  TUTOR: "bg-blue-100 text-blue-800",
  VIEWER: "bg-gray-100 text-gray-800",
  PARENT: "bg-green-100 text-green-800",
};

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserCard = memo(function UserCard({
  user,
  onEdit,
  onDelete,
}: UserCardProps) {
  const RoleIcon = roleIcons[user.role];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <RoleIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {user.name}
                </h3>
                <Badge className={roleColors[user.role]}>{user.role}</Badge>
                {!user.isActive && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Created {formatDate(user.createdAt)}
                {user.lastLoginAt && (
                  <span className="ml-4">
                    Last login {formatDate(user.lastLoginAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              data-testid={`edit-user-${user.id}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`delete-user-${user.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {user.name}? This action
                    cannot be undone. If the user has associated data, they will
                    be deactivated instead.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(user)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

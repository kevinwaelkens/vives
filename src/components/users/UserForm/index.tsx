"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import type { User, UserFormData } from "@/data/api/users";
import type { Role } from "@prisma/client";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  formData: Partial<UserFormData>;
  onFormDataChange: (data: Partial<UserFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const UserForm = memo(function UserForm({
  isOpen,
  onClose,
  editingUser,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
}: UserFormProps) {
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleRoleChange = (role: Role) => {
    onFormDataChange({ ...formData, role });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              data-testid="user-form-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              data-testid="user-form-email"
            />
          </div>
          <div>
            <Label htmlFor="password">
              Password {editingUser && "(leave blank to keep current)"}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required={!editingUser}
              data-testid="user-form-password"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger data-testid="user-form-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TUTOR">Tutor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
                <SelectItem value="PARENT">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="user-form-submit"
            >
              {isSubmitting
                ? "Saving..."
                : editingUser
                  ? "Update User"
                  : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

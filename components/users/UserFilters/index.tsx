"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Role } from "@prisma/client";

interface UserFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  roleFilter: Role | "ALL";
  onRoleFilterChange: (role: Role | "ALL") => void;
}

export const UserFilters = memo(function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UserFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                data-testid="search-users-input"
              />
            </div>
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value: Role | "ALL") => onRoleFilterChange(value)}
          >
            <SelectTrigger className="w-48" data-testid="role-filter-select">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="TUTOR">Tutor</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
              <SelectItem value="PARENT">Parent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});

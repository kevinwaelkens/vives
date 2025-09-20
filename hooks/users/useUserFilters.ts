import { useState, useMemo } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Role } from "@prisma/client";

export function useUserFilters() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Memoize filter parameters to prevent unnecessary rerenders
  const filterParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    role: roleFilter === "ALL" ? undefined : roleFilter,
  }), [debouncedSearch, roleFilter]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => 
    Boolean(search || roleFilter !== "ALL"), 
    [search, roleFilter]
  );

  return {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filterParams,
    hasActiveFilters,
  };
}

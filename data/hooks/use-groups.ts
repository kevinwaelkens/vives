import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi, type GroupFilters } from "@/data/api/groups";
import { toast } from "sonner";

// Query keys factory
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (filters?: GroupFilters) =>
    [...groupKeys.lists(), { filters }] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
};

// Get all groups
export function useGroups(filters?: GroupFilters) {
  return useQuery({
    queryKey: groupKeys.list(filters),
    queryFn: () => groupsApi.getGroups(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single group
export function useGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupsApi.getGroup(id),
    enabled: !!id,
  });
}

// Create group
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      toast.success("Group created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create group");
    },
  });
}

// Update group
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof groupsApi.updateGroup>[1];
    }) => groupsApi.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.id),
      });
      toast.success("Group updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update group");
    },
  });
}

// Delete group
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      toast.success("Group deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete group");
    },
  });
}

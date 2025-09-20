import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/data/api/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  data: (days?: number) => [...analyticsKeys.all, "data", { days }] as const,
};

export function useAnalytics(days?: number) {
  return useQuery({
    queryKey: analyticsKeys.data(days),
    queryFn: () => analyticsApi.getAnalytics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

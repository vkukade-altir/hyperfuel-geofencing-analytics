import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export const queryKeys = {
  health: ["health"] as const,
  dashboard: ["dashboard"] as const,
  users: ["users"] as const,
  timeline: (userId: string) => ["timeline", userId] as const,
  stationsCatalog: ["stations-catalog"] as const,
  entityAnalytics: (entityId: string) => ["entity-analytics", entityId] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => api.health(signal),
    staleTime: 60_000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) => api.dashboardSummary(signal),
    staleTime: 30_000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: ({ signal }) => api.listUsers(signal),
    staleTime: 15_000,
  });
}

export function useUserTimeline(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? queryKeys.timeline(userId) : ["timeline", "none"],
    queryFn: ({ signal }) => {
      if (!userId) throw new Error("No user selected");
      return api.userTimeline(userId, { limit: 1000 }, signal);
    },
    enabled: Boolean(userId),
    staleTime: 10_000,
  });
}

export function useStationsCatalog() {
  return useQuery({
    queryKey: queryKeys.stationsCatalog,
    queryFn: ({ signal }) => api.stationsCatalog(signal),
    staleTime: 30_000,
  });
}

export function useEntityAnalytics(entityId: string | undefined) {
  return useQuery({
    queryKey: entityId ? queryKeys.entityAnalytics(entityId) : ["entity-analytics", "none"],
    queryFn: ({ signal }) => {
      if (!entityId) throw new Error("No entity");
      return api.entityAnalytics(entityId, signal);
    },
    enabled: Boolean(entityId),
    staleTime: 30_000,
  });
}

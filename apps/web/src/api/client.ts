import type { ApiResponse } from "./types";

const BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success || body.data === null) {
    throw new ApiError(
      body.message || "Request failed",
      body.error?.code ?? "UNKNOWN",
    );
  }
  return body.data;
}

export const api = {
  health: (signal?: AbortSignal) =>
    request<import("./types").HealthStatus>("/health", signal),

  dashboardSummary: (signal?: AbortSignal) =>
    request<import("./types").DashboardSummary>(
      "/v1/analytics/dashboard/summary",
      signal,
    ),

  listUsers: (signal?: AbortSignal) =>
    request<import("./types").UserSummary[]>("/v1/analytics/users", signal),

  userTimeline: (
    userId: string,
    params?: { from?: string; to?: string; limit?: number },
    signal?: AbortSignal,
  ) => {
    const search = new URLSearchParams();
    if (params?.from) search.set("from", params.from);
    if (params?.to) search.set("to", params.to);
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return request<import("./types").UserTimeline>(
      `/v1/analytics/users/${encodeURIComponent(userId)}/timeline${qs ? `?${qs}` : ""}`,
      signal,
    );
  },

  stationsCatalog: (signal?: AbortSignal) =>
    request<import("./entityAnalyticsTypes").StationsCatalog>(
      "/v1/analytics/stations/catalog",
      signal,
    ),

  entityAnalytics: (entityId: string, signal?: AbortSignal) =>
    request<import("./entityAnalyticsTypes").EntityAnalyticsDetail>(
      `/v1/analytics/entities/${encodeURIComponent(entityId)}/analytics`,
      signal,
    ),
};

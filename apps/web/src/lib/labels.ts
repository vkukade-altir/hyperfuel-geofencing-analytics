/** Plain-language labels for dashboard UI. Code keeps ENTER/EXIT; humans see these. */

export function actionLabel(action: "ENTER" | "EXIT" | string | null): string {
  if (action === "ENTER") return "Arrived";
  if (action === "EXIT") return "Left";
  return action ?? "—";
}

export function placeTypeLabel(type: string | null): string {
  if (type === "station") return "Station";
  if (type === "amenity") return "Amenity";
  return type ?? "—";
}

export const UI = {
  locationUpdates: "Location updates",
  visits: "Visits",
  visitRecorded: "Visit recorded",
  places: "Places",
  peopleWhoVisited: "People who visited",
  totalVisits: "Total visits",
  timesLeft: "Times left",
  completedVisits: "Completed visits",
  stillThere: "Still there",
  timeSpent: "Time spent",
  avgTimeSpent: "Avg time spent",
  totalTimeSpent: "Total time spent",
  medianTimeSpent: "Typical visit length",
  arrived: "Arrived",
  left: "Left",
  atStation: "At station",
  atAmenity: "At amenity",
  notInsideAnywhere: "Not at any station or amenity right now",
  insideNow: "Inside now",
  drivers: "App users",
  stations: "Stations",
  amenities: "Amenities",
  searchByName: "Search by name or email",
  searchPlaces: "Search by place name",
  searchStations: "Search stations or stores",
  noDataYet: "No data yet",
  technicalDetails: "Technical details",
} as const;

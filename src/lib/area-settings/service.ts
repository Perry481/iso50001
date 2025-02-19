import type { Area } from "./types";

export async function getAreas(company: string): Promise<Area[]> {
  if (!company) {
    return [];
  }

  const response = await fetch(`/api/area-settings?company=${company}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch areas");
  }

  return data.areas;
}

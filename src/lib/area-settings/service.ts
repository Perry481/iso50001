import type { Area } from "./types";

class AreaSettingsService {
  async getAreas(): Promise<Area[]> {
    const response = await fetch(`/api/area-settings`);
    if (!response.ok) throw new Error("Failed to fetch areas");
    const data = await response.json();
    return data.areas;
  }
}

export const areaSettingsService = new AreaSettingsService();

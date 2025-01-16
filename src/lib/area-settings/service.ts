import type { Area } from "./types";

class AreaSettingsService {
  async getAreas(): Promise<Area[]> {
    const response = await fetch("/api/energy-equipment");
    if (!response.ok) throw new Error("Failed to fetch areas");
    const data = await response.json();
    return data.equipments;
  }
}

export const areaSettingsService = new AreaSettingsService();

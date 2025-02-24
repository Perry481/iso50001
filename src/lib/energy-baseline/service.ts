import type { EnergyBaseline } from "./types";
import { getApiUrl } from "@/lib/utils/api";

class EnergyBaselineService {
  async getBaselines(): Promise<EnergyBaseline[]> {
    try {
      const response = await fetch(getApiUrl("energy-baseline"));

      if (!response.ok) {
        throw new Error("Failed to fetch energy baselines");
      }

      const data = await response.json();
      return data.baselines;
    } catch (error) {
      console.error("Failed to fetch energy baselines:", error);
      throw error;
    }
  }
}

export const energyBaselineService = new EnergyBaselineService();

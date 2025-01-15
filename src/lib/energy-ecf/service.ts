import type { ECF } from "./types";

class EnergyECFService {
  async getECFs(): Promise<ECF[]> {
    const response = await fetch("/api/energy-ecf");
    if (!response.ok) throw new Error("Failed to fetch ECFs");
    const data = await response.json();
    return data.ecfs;
  }
}

export const energyECFService = new EnergyECFService();

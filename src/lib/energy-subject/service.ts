import type { EnergySubject } from "./types";

class EnergySubjectService {
  async getSubjects(): Promise<EnergySubject[]> {
    const response = await fetch("/api/energy-subject-settings");
    if (!response.ok) throw new Error("Failed to fetch energy subjects");
    const data = await response.json();
    return data;
  }
}

export const energySubjectService = new EnergySubjectService();

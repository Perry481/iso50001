import type { EnergySubject } from "./types";
import { getApiUrl } from "@/lib/utils/api";

export async function getSubjects(company: string): Promise<EnergySubject[]> {
  if (!company) {
    return [];
  }

  const response = await fetch(
    getApiUrl(`energy-subject-settings?company=${company}`)
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subjects");
  }

  return data.subjects;
}

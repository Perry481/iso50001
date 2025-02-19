import type { EnergySubject } from "./types";

export async function getSubjects(company: string): Promise<EnergySubject[]> {
  if (!company) {
    return [];
  }

  const response = await fetch(
    `/api/energy-subject-settings?company=${company}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subjects");
  }

  return data.subjects;
}

import type { ECF } from "./types";

export async function getECFs(company: string): Promise<ECF[]> {
  if (!company) {
    return [];
  }

  const response = await fetch(`/api/energy-ecf?company=${company}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch ECFs");
  }

  return data.ecfs;
}

import type { Equipment } from "./types";

export async function getEquipments(company: string): Promise<Equipment[]> {
  if (!company) {
    return [];
  }

  const response = await fetch(`/api/energy-equipment?company=${company}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch equipments");
  }

  return data.equipments;
}

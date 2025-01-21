import type { Equipment } from "./types";

class EnergyEquipmentService {
  async getEquipments(): Promise<Equipment[]> {
    const response = await fetch("/api/energy-equipment");
    if (!response.ok) throw new Error("Failed to fetch equipments");
    const data = await response.json();
    return data.equipments;
  }

  async createEquipment(equipment: Omit<Equipment, "id">): Promise<Equipment> {
    const response = await fetch("/api/energy-equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(equipment),
    });
    if (!response.ok) throw new Error("Failed to create equipment");
    const data = await response.json();
    return data.equipment;
  }

  async updateEquipment(equipment: Equipment): Promise<Equipment> {
    const response = await fetch("/api/energy-equipment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(equipment),
    });
    if (!response.ok) throw new Error("Failed to update equipment");
    const data = await response.json();
    return data.equipment;
  }

  async deleteEquipment(id: string): Promise<void> {
    const response = await fetch(`/api/energy-equipment/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete equipment");
  }
}

export const energyEquipmentService = new EnergyEquipmentService();

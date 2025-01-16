import type { DeviceReference } from "./types";

class DeviceReferenceService {
  async getDeviceReferences(): Promise<DeviceReference[]> {
    const response = await fetch("/api/device-reference");
    if (!response.ok) throw new Error("Failed to fetch device references");
    const data = await response.json();
    return data.devices;
  }
}

export const deviceReferenceService = new DeviceReferenceService();

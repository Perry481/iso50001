import type { DeviceReference } from "./types";
import { getApiUrl } from "@/lib/utils/api";

class DeviceReferenceService {
  async getDeviceReferences(): Promise<DeviceReference[]> {
    const response = await fetch(getApiUrl("device-reference"));
    if (!response.ok) throw new Error("Failed to fetch device references");
    const data = await response.json();
    return data.devices;
  }
}

export const deviceReferenceService = new DeviceReferenceService();

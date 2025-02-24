import { getApiUrl } from "@/lib/utils/api";
import type { ECF } from "./types";

export async function getECFs(companyName: string): Promise<ECF[]> {
  try {
    const response = await fetch(
      getApiUrl(`energy-ecf?company=${companyName}`)
    );
    const data = await response.json();
    return data.ecfs;
  } catch (error) {
    console.error("Failed to fetch ECFs:", error);
    return [];
  }
}

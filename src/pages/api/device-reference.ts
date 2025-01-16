import type { NextApiRequest, NextApiResponse } from "next";
import type { DeviceReference } from "@/lib/device-reference/types";

interface RawDeviceReference {
  MachineID: string;
  MachineName: string;
  KWHour: number | null;
}

interface RawApiResponse {
  page: number;
  total: number;
  records: number;
  rows: RawDeviceReference[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ devices: DeviceReference[] }>
) {
  try {
    const response = await fetch(
      "http://192.168.0.55:8080/SystemOptions/GetEnergyMachineList.ashx?selecttype=refmachine&rows=10000&page=1&sidx=MachineID&sord=asc",
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData: RawApiResponse = await response.json();

    // The raw data is already in the format we want, so we can use it directly
    const devices: DeviceReference[] = rawData.rows;

    res.status(200).json({ devices });
  } catch (error) {
    console.error("Failed to fetch device references:", error);
    res.status(500).json({ devices: [] });
  }
}

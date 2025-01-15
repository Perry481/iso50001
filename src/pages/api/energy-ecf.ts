import type { NextApiRequest, NextApiResponse } from "next";
import type { ECF } from "@/lib/energy-ecf/types";

interface RawECFData {
  EnergyTypeID: string;
  EnergyTypeName: string;
  UnitName: string;
  ECFFactor: number;
  Description?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ecfs: ECF[] }>
) {
  try {
    const response = await fetch(
      "http://192.168.0.55:8080/SystemOptions/GetEnergyTypeList.ashx?selecttype=ecflist",
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

    const rawData = await response.json();

    // Transform the data to match our ECF interface
    const ecfs: ECF[] = rawData.map((item: RawECFData) => ({
      id: item.EnergyTypeID,
      code: item.EnergyTypeID,
      name: item.EnergyTypeName,
      unit: item.UnitName,
      factor: item.ECFFactor,
      note: item.Description,
    }));

    res.status(200).json({ ecfs });
  } catch (error) {
    console.error("Failed to fetch ECFs:", error);
    res.status(500).json({ ecfs: [] });
  }
}

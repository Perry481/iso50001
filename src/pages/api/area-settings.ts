import type { NextApiRequest, NextApiResponse } from "next";
import type { Area } from "../area-settings";

interface ApiResponse {
  areas?: Area[];
  area?: Area;
  message?: string;
}

interface RawAreaData {
  EnergyAreaID: string;
  EnergyAreaName: string;
  Remark: string | null;
  DepartID: string | null;
  KWMeterID: string | null;
  CreatedTime: string | null;
  UpdatedTime: string | null;
}

interface RawApiResponse {
  page: number;
  total: number;
  records: number;
  rows: RawAreaData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const response = await fetch(
          "http://192.168.0.55:8080/SystemOptions/GetEnergyAreaList.ashx?rows=10000&page=1&sidx=EnergyAreaID&sord=asc",
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

        // Transform the data to match our Area interface
        const areas: Area[] = rawData.rows.map((item) => ({
          id: item.EnergyAreaID,
          code: item.EnergyAreaID,
          name: item.EnergyAreaName,
          department: item.DepartID || "(未設定)",
          meterNumber: item.KWMeterID ?? undefined,
          note: item.Remark ?? undefined,
        }));

        return res.status(200).json({ areas });
      } catch (error) {
        console.error("Failed to fetch areas:", error);
        return res.status(500).json({ message: "Failed to fetch areas" });
      }

    case "POST":
      const newArea: Area = {
        ...req.body,
        id: req.body.code, // Use the code as ID since that's what the real API does
      };
      return res.status(201).json({ area: newArea });

    case "PUT":
      const updatedArea = req.body;
      return res.status(200).json({ area: updatedArea });

    case "DELETE":
      return res.status(200).json({ message: "Area deleted successfully" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

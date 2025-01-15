import type { NextApiRequest, NextApiResponse } from "next";
import type { EnergyUsage } from "../org-energy-usage";

interface ApiResponse {
  records?: EnergyUsage[];
  record?: EnergyUsage;
  message?: string;
}

interface RawEnergyData {
  ErSgt: number;
  EnergyName: string;
  EnergyCategoryID: string;
  EnergyTypeID: string;
  EnergyTypeName: string;
  UnitName: string;
  StartDate: string;
  EndDate: string;
  KWMeterID: string;
  Quantity: number;
  Remark: string;
  CreatedTime: string;
  UpdatedTime: string;
}

// Helper function to convert /Date(timestamp)/ to YYYY-MM-DD
function convertDateFormat(dateString: string): string {
  const timestamp = parseInt(
    dateString.replace("/Date(", "").replace(")/", "")
  );
  return new Date(timestamp).toISOString().split("T")[0];
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
          "http://192.168.0.55:8080/SystemOptions/GetEnergyList.ashx?categoryid&_search=false&rows=50&page=1&sidx=ErSgt&sord=asc",
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

        const data = await response.json();

        // Transform the data to match our format
        const records: EnergyUsage[] = data.rows.map((item: RawEnergyData) => ({
          id: item.ErSgt,
          name: item.EnergyName,
          categoryCode: item.EnergyTypeID,
          categoryName: item.EnergyTypeName,
          startDate: convertDateFormat(item.StartDate),
          endDate: convertDateFormat(item.EndDate),
          usage: item.Quantity,
          unit: item.UnitName,
          meterNumber: item.KWMeterID.trim(),
          note: item.Remark || "",
        }));

        return res.status(200).json({ records });
      } catch (error) {
        console.error("Failed to fetch records:", error);
        return res.status(500).json({ message: "Failed to fetch records" });
      }

    case "POST":
      // TODO: Implement real API integration for POST
      const newRecord: EnergyUsage = {
        ...req.body,
        id: Date.now(), // Temporary ID generation
      };
      return res.status(201).json({ record: newRecord });

    case "PUT":
      // TODO: Implement real API integration for PUT
      const updatedRecord = req.body;
      return res.status(200).json({ record: updatedRecord });

    case "DELETE":
      // TODO: Implement real API integration for DELETE
      return res.status(200).json({ message: "Record deleted successfully" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

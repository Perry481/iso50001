import type { NextApiRequest, NextApiResponse } from "next";
import type { Area } from "../area-settings";

interface ApiResponse {
  areas?: Area[];
  area?: Area;
  error?: string;
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

interface ESGResponse {
  page: number;
  total: number;
  records: number;
  rows: RawAreaData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { company } = req.query;

    if (!company || typeof company !== "string") {
      return res.status(400).json({
        error: "Company is required",
      });
    }

    // Handle GET request - fetch list
    if (req.method === "GET") {
      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyAreaList.ashx?schema=${company}&rows=10000&page=1&sidx=EnergyAreaID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData: ESGResponse = await response.json();
      const areas: Area[] = rawData.rows.map((item: RawAreaData) => ({
        id: item.EnergyAreaID,
        code: item.EnergyAreaID,
        name: item.EnergyAreaName,
        department: item.DepartID || "(未設定)",
        meterNumber: item.KWMeterID || undefined,
        note: item.Remark || undefined,
      }));

      return res.status(200).json({ areas });
    }

    // Handle POST request - create new
    if (req.method === "POST") {
      const { code, name, department, meterNumber, note } = req.body;

      // Validate required fields
      if (!code || !name || !department) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the actual POST
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company);
      formData.append("EnergyAreaID", code);
      formData.append("EnergyAreaName", name);
      formData.append("DepartID", department);
      formData.append("KWMeterID", meterNumber || "");
      formData.append("Remark", note || "");

      const createResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyAreaList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create area");
      }
    }

    // Handle PUT request - update existing
    if (req.method === "PUT") {
      const { id, code, name, department, meterNumber, note } = req.body;

      // Validate required fields
      if (!id || !code || !name || !department) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the update
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company);
      formData.append("EnergyAreaID", code);
      formData.append("EnergyAreaName", name);
      formData.append("DepartID", department);
      formData.append("KWMeterID", meterNumber || "");
      formData.append("Remark", note || "");
      formData.append("id", id.toString());

      console.log("Update form data:", Object.fromEntries(formData));

      const updateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyAreaList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Update failed:", errorText);
        throw new Error(`Failed to update area: ${errorText}`);
      }

      // Log the response for debugging
      const updateResult = await updateResponse.text();
      console.log("Update response:", updateResult);
    }

    // Handle DELETE request
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          error: "Area ID is required for deletion",
        });
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company);
      formData.append("EnergyAreaID", id as string);

      const deleteResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyAreaList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete area");
      }
    }

    // For POST, PUT, and DELETE, fetch the updated list after the operation
    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyAreaList.ashx?schema=${company}&rows=10000&page=1&sidx=EnergyAreaID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const rawData: ESGResponse = await updatedResponse.json();
      const areas: Area[] = rawData.rows.map((item: RawAreaData) => ({
        id: item.EnergyAreaID,
        code: item.EnergyAreaID,
        name: item.EnergyAreaName,
        department: item.DepartID || "(未設定)",
        meterNumber: item.KWMeterID || undefined,
        note: item.Remark || undefined,
      }));

      return res.status(200).json({ areas });
    }

    // Handle unsupported methods
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

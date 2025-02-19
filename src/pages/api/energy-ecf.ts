import type { NextApiRequest, NextApiResponse } from "next";
import type { ECF } from "@/lib/energy-ecf/types";

interface RawECFData {
  EnergyTypeID: string;
  EnergyTypeName: string;
  UnitName: string;
  ECFFactor: number;
  Description?: string;
  EnergyCategoryID: string;
  TotalRatio: number;
}

interface ESGResponse {
  page: number;
  total: number;
  records: number;
  rows: RawECFData[];
}

interface ApiResponse {
  ecfs: ECF[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { company } = req.query;

    if (!company || typeof company !== "string") {
      return res.status(400).json({
        ecfs: [],
        error: "Company is required",
      });
    }

    // Handle GET request - fetch list
    if (req.method === "GET") {
      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyTypeList.ashx?schema=${company}&rows=2000&page=1&sidx=EnergyTypeID&sord=asc`,
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
      const ecfs: ECF[] = rawData.rows.map((item: RawECFData) => ({
        id: item.EnergyTypeID,
        code: item.EnergyTypeID,
        name: item.EnergyTypeName,
        unit: item.UnitName,
        factor: item.ECFFactor,
        note: item.Description,
      }));

      return res.status(200).json({ ecfs });
    }

    // Handle POST request - create new
    if (req.method === "POST") {
      const { code, name, unit, factor, note } = req.body;

      // Validate required fields
      if (!code || !name || !unit || factor === undefined) {
        return res.status(400).json({
          ecfs: [],
          error: "Missing required fields",
        });
      }

      // First validate the ID
      const validateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyTypeList.ashx?schema=${company}&selecttype=validate&EnergyTypeID=${code}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const validateData = await validateResponse.json();

      if (validateData.duplicate) {
        return res.status(400).json({
          ecfs: [],
          error: "EnergyTypeID already exists",
        });
      }

      // Create form data for the actual POST
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company);
      formData.append("EnergyTypeID", code);
      formData.append("EnergyTypeName", name);
      formData.append("UnitName", unit);
      formData.append("ECFFactor", factor.toString());
      formData.append("Description", note || "");
      formData.append("EnergyCategoryID", "1"); // Default category
      formData.append("TotalRatio", "0"); // Default ratio

      const createResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyTypeList.ashx`,
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
        throw new Error("Failed to create energy type");
      }
    }

    // Handle PUT request - update existing
    if (req.method === "PUT") {
      const { code, name, unit, factor, note, originalCode } = req.body;

      // Validate required fields
      if (!code || !name || !unit || factor === undefined || !originalCode) {
        return res.status(400).json({
          ecfs: [],
          error: "Missing required fields",
        });
      }

      // Create form data for the update
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company);
      formData.append("id", originalCode); // Original ID for identifying the record
      formData.append("EnergyTypeID", code); // New ID if changed
      formData.append("EnergyTypeName", name);
      formData.append("UnitName", unit);
      formData.append("ECFFactor", factor.toString());
      formData.append("Description", note || "");
      formData.append("EnergyCategoryID", "1");
      formData.append("TotalRatio", "0");

      const updateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyTypeList.ashx`,
        {
          method: "POST", // The API uses POST for updates too
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update energy type");
      }
    }

    // Handle DELETE request
    if (req.method === "DELETE") {
      const { code } = req.query; // Get the code from query params

      if (!code) {
        return res.status(400).json({
          ecfs: [],
          error: "EnergyTypeID is required for deletion",
        });
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company);
      formData.append("EnergyTypeID", code as string);

      const deleteResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyTypeList.ashx`,
        {
          method: "POST", // The API uses POST for deletion too
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete energy type");
      }
    }

    // For POST, PUT, and DELETE, fetch the updated list after the operation
    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyTypeList.ashx?schema=${company}&rows=2000&page=1&sidx=EnergyTypeID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const rawData: ESGResponse = await updatedResponse.json();
      const ecfs: ECF[] = rawData.rows.map((item: RawECFData) => ({
        id: item.EnergyTypeID,
        code: item.EnergyTypeID,
        name: item.EnergyTypeName,
        unit: item.UnitName,
        factor: item.ECFFactor,
        note: item.Description,
      }));

      return res.status(200).json({ ecfs });
    }

    // Handle unsupported methods
    return res.status(405).json({
      ecfs: [],
      error: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      ecfs: [],
      error: "Internal server error",
    });
  }
}

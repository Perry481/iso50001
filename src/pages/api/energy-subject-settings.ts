import { NextApiRequest, NextApiResponse } from "next";
import type { EnergySubject } from "@/lib/energy-subject/types";

interface ApiResponse {
  subjects?: EnergySubject[];
  error?: string;
}

interface RawSubjectData {
  EnergyGroupID: string;
  EnergyGroupName: string;
  Remark: string | null;
  CreatedTime: string | null;
  UpdatedTime: string | null;
}

interface ESGResponse {
  page: number;
  total: number;
  records: number;
  rows: RawSubjectData[];
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
        `https://esg.jtmes.net/OptonSetup/GetEnergyGroupList.ashx?schema=${company}&rows=10000&page=1&sidx=EnergyGroupID&sord=asc`,
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
      const subjects: EnergySubject[] = rawData.rows.map(
        (item: RawSubjectData) => ({
          id: item.EnergyGroupID,
          code: item.EnergyGroupID,
          name: item.EnergyGroupName,
          note: item.Remark || undefined,
        })
      );

      return res.status(200).json({ subjects });
    }

    // Handle POST request - create new
    if (req.method === "POST") {
      const { code, name, note } = req.body;

      // Validate required fields
      if (!code || !name) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the actual POST
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company);
      formData.append("EnergyGroupID", code);
      formData.append("EnergyGroupName", name);
      formData.append("Remark", note || "");

      const createResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyGroupList.ashx`,
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
        throw new Error("Failed to create subject");
      }
    }

    // Handle PUT request - update existing
    if (req.method === "PUT") {
      const { id, code, name, note } = req.body;

      // Validate required fields
      if (!id || !code || !name) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the update
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company);
      formData.append("EnergyGroupID", code);
      formData.append("EnergyGroupName", name);
      formData.append("Remark", note || "");
      formData.append("id", id.toString());

      const updateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyGroupList.ashx`,
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
        throw new Error("Failed to update subject");
      }
    }

    // Handle DELETE request
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          error: "Subject ID is required for deletion",
        });
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company);
      formData.append("EnergyGroupID", id as string);

      const deleteResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyGroupList.ashx`,
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
        throw new Error("Failed to delete subject");
      }
    }

    // For POST, PUT, and DELETE, fetch the updated list after the operation
    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyGroupList.ashx?schema=${company}&rows=10000&page=1&sidx=EnergyGroupID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const rawData: ESGResponse = await updatedResponse.json();
      const subjects: EnergySubject[] = rawData.rows.map(
        (item: RawSubjectData) => ({
          id: item.EnergyGroupID,
          code: item.EnergyGroupID,
          name: item.EnergyGroupName,
          note: item.Remark || undefined,
        })
      );

      return res.status(200).json({ subjects });
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

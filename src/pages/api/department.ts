import type { NextApiRequest, NextApiResponse } from "next";

interface Department {
  id?: string;
  departId: string;
  departName: string;
  engName: string;
}

interface ApiResponse {
  departments?: Department[];
  department?: Department;
  error?: string;
}

interface RawDepartmentData {
  DepartID: string;
  DepartName: string;
  EngName: string;
  ParentID: string | null;
}

interface ESGResponse {
  page: number;
  total: number;
  records: number;
  rows: RawDepartmentData[];
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
        `https://esg.jtmes.net/OptonSetup/GetDepartment.ashx?schema=${company}&rows=20000&page=1&sidx=DepartID&sord=asc`,
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
      const departments: Department[] = rawData.rows.map(
        (item: RawDepartmentData) => ({
          id: item.DepartID,
          departId: item.DepartID,
          departName: item.DepartName,
          engName: item.EngName || "",
        })
      );

      return res.status(200).json({ departments });
    }

    // Handle POST request - create new
    if (req.method === "POST") {
      const { departId, departName, engName } = req.body;

      // Validate required fields
      if (!departId || !departName) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the actual POST
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company);
      formData.append("DepartID", departId);
      formData.append("DepartName", departName);
      formData.append("EngName", engName || "");

      const createResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetDepartment.ashx`,
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
        throw new Error("Failed to create department");
      }
    }

    // Handle PUT request - update existing
    if (req.method === "PUT") {
      const { id, departId, departName, engName } = req.body;

      // Validate required fields
      if (!id || !departId || !departName) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the update
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company);
      formData.append("DepartID", departId);
      formData.append("DepartName", departName);
      formData.append("EngName", engName || "");
      formData.append("id", id.toString());

      const updateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetDepartment.ashx`,
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
        throw new Error("Failed to update department");
      }
    }

    // Handle DELETE request
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          error: "Department ID is required for deletion",
        });
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company);
      formData.append("DepartID", id as string);

      const deleteResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetDepartment.ashx`,
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
        throw new Error("Failed to delete department");
      }
    }

    // For POST, PUT, and DELETE, fetch the updated list after the operation
    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetDepartment.ashx?schema=${company}&rows=20000&page=1&sidx=DepartID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const rawData: ESGResponse = await updatedResponse.json();
      const departments: Department[] = rawData.rows.map(
        (item: RawDepartmentData) => ({
          id: item.DepartID,
          departId: item.DepartID,
          departName: item.DepartName,
          engName: item.EngName || "",
        })
      );

      return res.status(200).json({ departments });
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

import type { NextApiRequest, NextApiResponse } from "next";
import type { EnergyUsage } from "../org-energy-usage";

interface ApiResponse {
  records?: EnergyUsage[];
  record?: EnergyUsage;
  error?: string;
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
  try {
    const { company } = req.query;
    console.log("API Request:", {
      method: req.method,
      query: req.query,
      body: req.body,
    });

    if (!company || typeof company !== "string") {
      console.log("Company validation failed:", { company });
      return res.status(400).json({
        records: [],
        error: "Company is required",
      });
    }

    // Handle GET request - fetch list
    if (req.method === "GET") {
      console.log("Processing GET request");
      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyList.ashx?schema=${company}&rows=10000&page=1&sidx=ErSgt&sord=asc`,
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
    }

    // Handle POST request - create new
    if (req.method === "POST") {
      console.log("Processing POST request");
      console.log("Raw request body:", req.body);

      const {
        name,
        categoryCode,
        startDate,
        endDate,
        usage,
        meterNumber,
        note,
      } = req.body;

      console.log("Extracted fields:", {
        name,
        categoryCode,
        startDate,
        endDate,
        usage,
        meterNumber,
        note,
      });

      // Validate required fields
      if (
        !name ||
        !categoryCode ||
        !startDate ||
        !endDate ||
        usage === undefined ||
        !meterNumber
      ) {
        const missingFields = [
          !name && "name",
          !categoryCode && "categoryCode",
          !startDate && "startDate",
          !endDate && "endDate",
          usage === undefined && "usage",
          !meterNumber && "meterNumber",
        ].filter(Boolean);

        console.log("Validation failed. Missing fields:", missingFields);
        return res.status(400).json({
          records: [],
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Create form data for the actual POST
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company);
      formData.append("EnergyName", name);
      formData.append("EnergyTypeID", categoryCode);
      formData.append("StartDate", startDate);
      formData.append("EndDate", endDate);
      formData.append("Quantity", usage.toString());
      formData.append("KWMeterID", meterNumber);
      formData.append("Remark", note || "");

      console.log("Form data prepared:", Object.fromEntries(formData));

      const createResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      console.log("Create response status:", createResponse.status);
      const createResponseData = await createResponse.text();
      console.log("Create response data:", createResponseData);

      if (!createResponse.ok) {
        throw new Error(
          `Failed to create energy usage record: ${createResponseData}`
        );
      }
    }

    // Handle PUT request - update existing
    if (req.method === "PUT") {
      console.log("Processing PUT request");
      console.log("Raw request body:", req.body);

      const {
        id,
        name,
        categoryCode,
        startDate,
        endDate,
        usage,
        meterNumber,
        note,
      } = req.body;

      console.log("Extracted fields:", {
        id,
        name,
        categoryCode,
        startDate,
        endDate,
        usage,
        meterNumber,
        note,
      });

      // Validate required fields
      if (
        !id ||
        !name ||
        !categoryCode ||
        !startDate ||
        !endDate ||
        usage === undefined ||
        !meterNumber
      ) {
        const missingFields = [
          !id && "id",
          !name && "name",
          !categoryCode && "categoryCode",
          !startDate && "startDate",
          !endDate && "endDate",
          usage === undefined && "usage",
          !meterNumber && "meterNumber",
        ].filter(Boolean);

        console.log("Validation failed. Missing fields:", missingFields);
        return res.status(400).json({
          records: [],
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Create form data for the update
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company);
      formData.append("ErSgt", id.toString());
      formData.append("EnergyName", name);
      formData.append("EnergyTypeID", categoryCode);
      formData.append("StartDate", startDate);
      formData.append("EndDate", endDate);
      formData.append("Quantity", usage.toString());
      formData.append("KWMeterID", meterNumber);
      formData.append("Remark", note || "");

      console.log("Form data prepared:", Object.fromEntries(formData));

      const updateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      console.log("Update response status:", updateResponse.status);
      const updateResponseData = await updateResponse.text();
      console.log("Update response data:", updateResponseData);

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update energy usage record: ${updateResponseData}`
        );
      }
    }

    // Handle DELETE request
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          records: [],
          error: "Record ID is required for deletion",
        });
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company);
      formData.append("ErSgt", id as string);

      const deleteResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyList.ashx`,
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
        throw new Error("Failed to delete energy usage record");
      }
    }

    // For POST, PUT, and DELETE, fetch the updated list after the operation
    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyList.ashx?schema=${company}&rows=10000&page=1&sidx=ErSgt&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await updatedResponse.json();
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
    }

    // Handle unsupported methods
    return res.status(405).json({
      records: [],
      error: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      records: [],
      error: "Internal server error",
    });
  }
}

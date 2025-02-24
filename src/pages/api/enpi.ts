import type { NextApiRequest, NextApiResponse } from "next";

interface IndicatorData {
  date: string;
  actualValue: number;
  theoreticalValue: number;
  maxDeviation: number;
  deviation: number;
  remark: string | null;
  [key: string]: number | string | null;
}

interface Indicator {
  id: string;
  name: string;
  baselineName: string;
  energyType: {
    id: string;
    name: string;
    unit: string;
  };
  unit: string;
  startDate: string;
  frequency: "月" | "週" | "日" | "季";
  dataType: string;
  data: IndicatorData[];
  remark: string | null;
}

interface ApiResponse {
  indicators?: Indicator[];
  message?: string;
}

interface ApiIndicatorResponse {
  page: number;
  total: number;
  records: number;
  rows: Array<{
    EnPiID: string;
    EnPiName: string;
    Remark: string | null;
    EbSgt: number;
    EnergyBaselineName: string;
    EnergyScopeID: string | null;
    EnergyMarginID: string | null;
    EnergyTypeID: string;
    UnitName: string;
    StartDate: string;
    EndDate: string | null;
    FrequencyTypeCode: string;
    DataTypeCode: string;
    CreatedTime: string;
    UpdatedTime: string;
  }>;
}

interface ApiDetailResponse {
  page: number;
  total: number;
  records: number;
  rows: Array<{
    EnPiID: string;
    StartDate: string;
    Value: number;
    X1: number | null;
    X2: number | null;
    X3: number | null;
    X4: number | null;
    X5: number | null;
    Estimate: number;
    ErrorRatio: number;
    MERPercent: string;
    Remark: string | null;
  }>;
}

// Add frequency type mapping constants
const FREQUENCY_TYPE_TO_CODE: Record<string, string> = {
  月: "M",
  週: "W",
  日: "D",
  季: "S",
};

const FREQUENCY_CODE_TO_TYPE: Record<string, "月" | "週" | "日" | "季"> = {
  M: "月",
  W: "週",
  D: "日",
  S: "季",
};

const BASE_URL = "https://esg.jtmes.net/OptonSetup";

function transformDate(dateString: string): string {
  if (dateString.includes("/Date(")) {
    // Handle .NET JSON date format
    const timestamp = parseInt(dateString.replace(/\/Date\((\d+)\)\//, "$1"));
    const date = new Date(timestamp);
    // Add 8 hours for GMT+8
    date.setHours(date.getHours() + 8);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  } else {
    // Handle regular date string
    const date = new Date(dateString);
    // Add 8 hours for GMT+8
    date.setHours(date.getHours() + 8);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }
}

async function fetchIndicatorDetails(
  enPiId: string,
  company: string
): Promise<IndicatorData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/GetEnergyPerformanceDetail.ashx?schema=${company}&EnPiID=${enPiId}&rows=10000&page=1&sidx=StartDate&sord=asc`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: ApiDetailResponse = await response.json();

    return data.rows.map((row) => ({
      date: transformDate(row.StartDate),
      actualValue: row.Value,
      theoreticalValue: row.Estimate,
      maxDeviation: parseFloat(row.MERPercent),
      deviation: row.ErrorRatio,
      remark: row.Remark || null,
      X1: row.X1,
      X2: row.X2,
      X3: row.X3,
      X4: row.X4,
      X5: row.X5,
    }));
  } catch (error) {
    console.error("Failed to fetch indicator details:", error);
    return [];
  }
}

async function fetchIndicators(company: string): Promise<Indicator[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}&rows=10000&page=1&sidx=EnPiID&sord=asc`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: ApiIndicatorResponse = await response.json();

    // Fetch details for each indicator
    const indicatorsWithDetails = await Promise.all(
      data.rows.map(async (row) => {
        const details = await fetchIndicatorDetails(row.EnPiID, company);
        const frequency = FREQUENCY_CODE_TO_TYPE[row.FrequencyTypeCode] || "月";

        return {
          id: row.EnPiID,
          name: row.EnPiName,
          baselineName: row.EnergyBaselineName,
          energyType: {
            id: row.EnergyTypeID,
            name: "(未設定)",
            unit: row.UnitName,
          },
          unit: row.UnitName,
          startDate: transformDate(row.StartDate),
          frequency,
          dataType: row.DataTypeCode === "S" ? "單一量測" : "比率分析",
          data: details,
          remark: row.Remark,
        };
      })
    );

    return indicatorsWithDetails;
  } catch (error) {
    console.error("Failed to fetch indicators:", error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const { company } = req.query;

      if (!company || typeof company !== "string") {
        return res.status(400).json({
          message: "Company parameter is required",
        });
      }

      const indicators = await fetchIndicators(company);
      return res.status(200).json({ indicators });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { company } = req.query;
      const data = req.body;

      if (!company || typeof company !== "string") {
        return res.status(400).json({
          message: "Company parameter is required",
        });
      }

      // First get current state to determine next EnPiID
      const response = await fetch(
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}&rows=200&page=1&sidx=EnPiID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const currentData = await response.json();

      // Calculate next EnPiID
      const nextEnPiID =
        currentData.rows.length > 0
          ? String(
              Number(
                Math.max(
                  ...currentData.rows.map((row: { EnPiID: string }) =>
                    parseInt(row.EnPiID, 10)
                  )
                )
              ) + 1
            ).padStart(3, "0")
          : "001";

      // Create form data for the POST request
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company);
      formData.append("EnPiID", nextEnPiID);
      formData.append("EnPiName", data.name);
      formData.append("Remark", data.remark || "");
      formData.append("EbSgt", data.ebSgt);
      formData.append("EnergyBaselineName", data.baselineName);
      formData.append("EnergyTypeID", data.energyType.id);
      formData.append("EnergyScopeID", "");
      formData.append("EnergyMarginID", "");
      formData.append(
        "FrequencyTypeCode",
        FREQUENCY_TYPE_TO_CODE[data.frequency] || "M"
      );
      formData.append("DataTypeCode", data.dataType === "單一量測" ? "S" : "R");
      formData.append("StartDate", data.startDate);
      formData.append("EndDate", "");

      console.log("Form data:", formData.toString());
      console.log(
        "Request URL:",
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}`
      );

      const addResponse = await fetch(
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      console.log("Add response status:", addResponse.status);
      const responseText = await addResponse.text();
      console.log("Add response text:", responseText);

      if (!addResponse.ok) {
        throw new Error(`Failed to add indicator: ${responseText}`);
      }

      // Fetch updated indicators
      const indicators = await fetchIndicators(company);
      return res.status(200).json({ indicators });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const { company } = req.query;
      const data = req.body;

      if (!company || typeof company !== "string") {
        return res.status(400).json({
          message: "Company parameter is required",
        });
      }

      if (!data.id) {
        return res.status(400).json({
          message: "Indicator ID is required for editing",
        });
      }

      // Create form data for the PUT request
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company);
      formData.append("EnPiID", data.id);
      formData.append("EnPiName", data.name);
      formData.append("Remark", data.remark || "");
      formData.append("EbSgt", data.ebSgt);
      formData.append("EnergyBaselineName", data.baselineName);
      formData.append("EnergyTypeID", data.energyType.id);
      formData.append("EnergyScopeID", "");
      formData.append("EnergyMarginID", "");
      formData.append(
        "FrequencyTypeCode",
        FREQUENCY_TYPE_TO_CODE[data.frequency] || "M"
      );
      formData.append("DataTypeCode", data.dataType === "單一量測" ? "S" : "R");
      formData.append("StartDate", data.startDate);
      formData.append("EndDate", "");

      console.log("Edit form data:", formData.toString());
      console.log(
        "Edit URL:",
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}`
      );

      const editResponse = await fetch(
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      console.log("Edit response status:", editResponse.status);
      const responseText = await editResponse.text();
      console.log("Edit response text:", responseText);

      if (!editResponse.ok) {
        throw new Error(`Failed to edit indicator: ${responseText}`);
      }

      // Fetch updated indicators
      const indicators = await fetchIndicators(company);
      return res.status(200).json({ indicators });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { company, id } = req.query;

      if (!company || typeof company !== "string") {
        return res.status(400).json({
          message: "Company parameter is required",
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          message: "Indicator ID is required for deletion",
        });
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company);
      formData.append("EnPiID", id);

      console.log("Delete form data:", formData.toString());
      console.log(
        "Delete URL:",
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}`
      );

      const deleteResponse = await fetch(
        `${BASE_URL}/GetEnergyPerformanceIndex.ashx?schema=${company}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      console.log("Delete response status:", deleteResponse.status);
      const responseText = await deleteResponse.text();
      console.log("Delete response text:", responseText);

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete indicator: ${responseText}`);
      }

      // Fetch updated indicators
      const indicators = await fetchIndicators(company);
      return res.status(200).json({ indicators });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}

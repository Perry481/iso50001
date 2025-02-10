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
  baselineCode: string;
  energyType: {
    id: string;
    name: string;
    unit: string;
  };
  unit: string;
  startDate: string;
  frequency: "月" | "週";
  dataType: string;
  data: IndicatorData[];
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
    EbSgt: number;
    EnergyBaselineName: string;
    EnergyTypeID: string;
    UnitName: string;
    StartDate: string;
    FrequencyTypeCode: string;
    DataTypeCode: string;
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

function transformDate(dateString: string): string {
  // Remove "/Date(" and ")/" and convert to number
  const timestamp = parseInt(dateString.replace(/\/Date\((\d+)\)\//, "$1"));
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

async function fetchIndicatorDetails(enPiId: string): Promise<IndicatorData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyPerformanceDetail.ashx?EnPiID=${enPiId}&rows=10000&page=1&sidx=StartDate&sord=asc`
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

async function fetchIndicators(): Promise<Indicator[]> {
  try {
    const response = await fetch(
      "http://192.168.0.55:8080/SystemOptions/GetEnergyPerformanceIndex.ashx?&rows=10000&page=1&sidx=EnPiID&sord=asc"
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: ApiIndicatorResponse = await response.json();

    // Fetch details for each indicator
    const indicatorsWithDetails = await Promise.all(
      data.rows.map(async (row) => {
        const details = await fetchIndicatorDetails(row.EnPiID);
        const frequency: "月" | "週" =
          row.FrequencyTypeCode === "M" ? "月" : "週";

        return {
          id: row.EnPiID,
          name: row.EnPiName,
          baselineCode: row.EnergyBaselineName,
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
      const indicators = await fetchIndicators();
      return res.status(200).json({ indicators });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}

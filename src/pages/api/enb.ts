import { NextApiRequest, NextApiResponse } from "next";

interface ENBData {
  baselineCode: string;
  targetItem: string;
  energyType: string;
  workArea: string;
  sharedGroup: string;
  locked: string;
  note: string;
  X1: string;
  X2: string;
  X3?: string;
  X4?: string;
  X5?: string;
}

interface BaselineData {
  id: number;
  date: string;
  value: number;
  X1: number;
  X2?: number;
  X3?: number;
  X4?: number;
  X5?: number;
}

interface RegressionData {
  quadratic: {
    a: number;
    b: number;
    c: number;
    y: string;
    rSquare: number;
  };
  linear: {
    X1Label: string;
    X2Label: string;
    X3Label: string;
    X1Coefficient: number;
    X2Coefficient: number;
    X3Coefficient: number;
    constant: number;
    equation: string;
    rSquare: number;
    MBE: number;
    MBEPercentage: number;
    MAE: number;
    MAEPercentage: number;
    RMSE: number;
    CvRMSE: number;
    maxError: number;
  };
}

interface ChartData {
  Data: [number, number, number][];
  Unit: string;
  Caption: string;
}

interface BaselineDetails {
  baselineData: BaselineData[];
  regressionData: RegressionData;
  chartData: Record<string, ChartData>;
  comparisonData: {
    date: string;
    actualValue: number;
    theoreticalValue: number;
  }[];
}

interface ApiENBResponse {
  page: number;
  total: number;
  records: number;
  rows: ApiENBRow[];
}

interface ApiENBRow {
  EbSgt: number;
  EnergyBaselineName: string;
  Remark: string;
  SourceTypeCode: string;
  EnergyTypeID: string;
  EceSgt: number | null;
  EnergyGroupID: string;
  EnergyAreaID: string;
  UseX1: boolean;
  UseX2: boolean;
  UseX3: boolean;
  UseX4: boolean;
  UseX5: boolean;
  IsLock: boolean;
  CreatedTime: string;
  UpdatedTime: string;
  CaptionX1: string | null;
  CaptionX2: string | null;
  CaptionX3: string | null;
  CaptionX4: string | null;
  CaptionX5: string | null;
  UnitX1: string | null;
  UnitX2: string | null;
  UnitX3: string | null;
  UnitX4: string | null;
  UnitX5: string | null;
}

async function fetchENBData(): Promise<ENBData[]> {
  try {
    // First try to get the ENB data
    const enbResponse = await fetch(
      "http://192.168.0.55:8080/SystemOptions/GetEnergyBaselineMain.ashx?_search=false&rows=1000&page=1&sidx=EbSgt&sord=asc"
    );

    if (!enbResponse.ok) {
      throw new Error(`ENB API responded with status: ${enbResponse.status}`);
    }

    const enbData: ApiENBResponse = await enbResponse.json();
    // console.log("ENB API Response rows:", enbData.rows);

    if (!enbData.rows?.length) {
      console.warn("ENB API returned no rows");
      return [];
    }

    // Transform the data with area mapping
    const transformedData = enbData.rows.map((row) => {
      // Log each row's area mapping for debugging
      const mappedAreaName = row.EnergyAreaID;
      // console.log(
      //   `Processing row: EnergyAreaID=${row.EnergyAreaID}, Mapped Name=${mappedAreaName}`
      // );

      const result = {
        baselineCode: row.EnergyBaselineName,
        targetItem:
          {
            C: "能源分類",
            A: "全公司",
            M: "工作場域",
            G: "設備群組",
          }[row.SourceTypeCode] || row.SourceTypeCode,
        energyType: row.EnergyTypeID,
        workArea: mappedAreaName || row.EnergyAreaID,
        sharedGroup: row.EnergyGroupID,
        locked: row.IsLock ? "鎖定" : "未鎖定",
        note: row.Remark,
        X1: row.UseX1 ? row.CaptionX1 || "" : "未使用",
        X2: row.UseX2 ? row.CaptionX2 || "" : "未使用",
        X3: row.UseX3 ? row.CaptionX3 || "" : "未使用",
        X4: row.UseX4 ? row.CaptionX4 || "" : "未使用",
        X5: row.UseX5 ? row.CaptionX5 || "" : "未使用",
      };
      // console.log("Transformed item:", result);
      return result;
    });

    console.log("Final Transformed Data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Failed to fetch ENB data:", error);
    throw error; // Let the handler deal with the error
  }
}

const mockBaselineDetails: Record<string, BaselineDetails> = {
  "EnB-003_02_生管公務車ARJ-9205加油公升(L)": {
    baselineData: [
      {
        id: 1,
        date: "2022-02-14",
        value: 95.45,
        X1: 866,
      },
    ],
    regressionData: {
      quadratic: {
        a: -8.064,
        b: 922.0993,
        c: 14827.471,
        y: "y = -8.064x^2 + 922.0993x + 14827.471",
        rSquare: 0.984,
      },
      linear: {
        X1Label: "X1 溫度超過24度天數",
        X2Label: "X2 自動壓著機稼動工時",
        X3Label: "X3 射出機稼動工時",
        X1Coefficient: 578.7519,
        X2Coefficient: 7.5047,
        X3Coefficient: -12.3602,
        constant: 15112.2625,
        equation: "Y = 578.7519*X1 + 7.5047*X2 + -12.3602*X3 + 15112.2625",
        rSquare: 0.9887,
        MBE: 7.84178458464642e-7,
        MBEPercentage: -0.43,
        MAE: 955.574268720711,
        MAEPercentage: 4.9117,
        RMSE: 1073.0053,
        CvRMSE: 4.4871,
        maxError: 13.48,
      },
    },
    chartData: {
      X1: {
        Data: [
          [140, 24.01, 16.444],
          [456, 49.2, 67.992],
        ],
        Unit: "",
        Caption: "里程數",
      },
    },
    comparisonData: [
      { date: "2022-02-14", actualValue: 95.45, theoreticalValue: 114.57 },
      { date: "2022-02-21", actualValue: 110.44, theoreticalValue: 119.08 },
    ],
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const data = await fetchENBData();

      // Only process these if we have data
      const targetItems = Array.from(
        new Set(data.map((item) => item.targetItem))
      ).filter(Boolean);
      const energyTypes = Array.from(
        new Set(data.map((item) => item.energyType))
      ).filter(Boolean);
      const workAreas = Array.from(
        new Set(data.map((item) => item.workArea))
      ).filter(Boolean);
      const sharedGroups = Array.from(
        new Set(data.map((item) => item.sharedGroup))
      ).filter(Boolean);
      const lockedStates = ["鎖定", "未鎖定"];

      res.status(200).json({
        data,
        targetItems,
        energyTypes,
        workAreas,
        sharedGroups,
        lockedStates,
        baselineDetails: mockBaselineDetails,
      });
    } catch (error) {
      console.error("API Error:", error);
      // Return a more detailed error response
      res.status(500).json({
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

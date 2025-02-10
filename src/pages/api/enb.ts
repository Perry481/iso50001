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
  ebSgt: number;
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
  createdTime: string;
  updatedTime: string;
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

interface ApiBaselineDetailResponse {
  page: number;
  total: number;
  records: number;
  rows: ApiBaselineDetailRow[];
}

interface ApiBaselineDetailRow {
  EbSgt: number;
  StartDate: string;
  Value: number;
  X1: number | null;
  X2: number | null;
  X3: number | null;
  X4: number | null;
  X5: number | null;
  CreatedTime: string;
  UpdatedTime: string;
}

interface RegressionStaticResponse {
  a: number;
  b: number;
  c: number;
  rSquare: number;
  y: string;
  Property: [string, string][];
  Qty: number[][];
  Category: string[];
  Title: string[];
}

interface BaselineRegressionResponse {
  Data: [number, number][];
  Unit: string;
  Caption: string;
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
        ebSgt: row.EbSgt,
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

function transformDate(dateString: string): string {
  // Remove "/Date(" and ")/" and convert to number
  const timestamp = parseInt(dateString.replace(/\/Date\((\d+)\)\//, "$1"));
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

async function fetchBaselineDetails(ebSgt: number): Promise<BaselineData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyBaselineDetail.ashx?EbSgt=${ebSgt}&_search=false&rows=10000&page=1&sidx=StartDate&sord=asc`
    );

    if (!response.ok) {
      throw new Error(
        `Baseline details API responded with status: ${response.status}`
      );
    }

    const data: ApiBaselineDetailResponse = await response.json();

    return data.rows.map((row) => ({
      id: row.EbSgt,
      date: transformDate(row.StartDate),
      value: row.Value,
      X1: row.X1 ?? 0,
      X2: row.X2 ?? undefined,
      X3: row.X3 ?? undefined,
      X4: row.X4 ?? undefined,
      X5: row.X5 ?? undefined,
      createdTime: transformDate(row.CreatedTime),
      updatedTime: transformDate(row.UpdatedTime),
    }));
  } catch (error) {
    console.error("Failed to fetch baseline details:", error);
    return [];
  }
}

async function fetchRegressionStatic(
  ebSgt: number,
  feature: string
): Promise<{
  regressionData: RegressionData;
  comparisonData: {
    date: string;
    actualValue: number;
    theoreticalValue: number;
  }[];
}> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyBaselineDetail.ashx?selecttype=regressionstatic&EbSgt=${ebSgt}&Feature=${feature}`
    );

    if (!response.ok) {
      throw new Error(
        `Regression API responded with status: ${response.status}`
      );
    }

    const data: RegressionStaticResponse = await response.json();

    // Helper function to find property value
    const findProperty = (key: string) => {
      const prop = data.Property.find(([k]) => k === key);
      return prop ? prop[1] : "";
    };

    // Transform the data to match our interfaces
    const regressionData: RegressionData = {
      quadratic: {
        a: data.a,
        b: data.b,
        c: data.c,
        y: data.y,
        rSquare: data.rSquare,
      },
      linear: {
        X1Label: (findProperty("影響因素").split(",")[0] || "").trim(),
        X2Label: (findProperty("影響因素").split(",")[1] || "").trim(),
        X3Label: "", // Not provided in the API
        X1Coefficient: parseFloat(findProperty("X1斜率")),
        X2Coefficient: parseFloat(findProperty("X2斜率")),
        X3Coefficient: 0, // Not provided in the API
        constant: parseFloat(findProperty("截矩")),
        equation: findProperty("預測公式"),
        rSquare: parseFloat(findProperty("RSquare")),
        MBE: parseFloat(findProperty("MBE (均偏差誤差)")),
        MBEPercentage: parseFloat(findProperty("平均偏差誤差比")),
        MAE: parseFloat(findProperty("MAE (平均絕對誤差)")),
        MAEPercentage: parseFloat(findProperty("平均絕對誤差比")),
        RMSE: parseFloat(findProperty("RMSE (均方根誤差)")),
        CvRMSE: parseFloat(findProperty("Cv(RMSE) (均方根誤差變異係數)")),
        maxError: parseFloat(findProperty("最大誤差比(M-S)/S")),
      },
    };

    // Transform comparison data
    const comparisonData = data.Category.map((date, index) => ({
      date,
      actualValue: data.Qty[0][index],
      theoreticalValue: data.Qty[1][index],
    }));

    return {
      regressionData,
      comparisonData,
    };
  } catch (error) {
    console.error("Failed to fetch regression static:", error);
    return {
      regressionData: {
        quadratic: {
          a: 0,
          b: 0,
          c: 0,
          y: "",
          rSquare: 0,
        },
        linear: {
          X1Label: "",
          X2Label: "",
          X3Label: "",
          X1Coefficient: 0,
          X2Coefficient: 0,
          X3Coefficient: 0,
          constant: 0,
          equation: "",
          rSquare: 0,
          MBE: 0,
          MBEPercentage: 0,
          MAE: 0,
          MAEPercentage: 0,
          RMSE: 0,
          CvRMSE: 0,
          maxError: 0,
        },
      },
      comparisonData: [],
    };
  }
}

async function fetchBaselineRegression(
  ebSgt: number,
  feature: string
): Promise<BaselineRegressionResponse> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyBaselineDetail.ashx?selecttype=baselineregression&EbSgt=${ebSgt}&Feature=${feature}`
    );

    if (!response.ok) {
      throw new Error(
        `Baseline regression API responded with status: ${response.status}`
      );
    }

    const data: BaselineRegressionResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch baseline regression:", error);
    return {
      Data: [],
      Unit: "",
      Caption: "",
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const ebSgt = req.query.ebSgt;
      const feature = req.query.feature;

      if (ebSgt && !Array.isArray(ebSgt)) {
        if (feature && !Array.isArray(feature)) {
          // Fetch all required data
          const [regressionStatic, baselineDetails, baselineRegression] =
            await Promise.all([
              fetchRegressionStatic(Number(ebSgt), feature),
              fetchBaselineDetails(Number(ebSgt)),
              fetchBaselineRegression(Number(ebSgt), feature),
            ]);

          // Calculate regression line points
          const { a, b, c } = regressionStatic.regressionData.quadratic;

          // Instead of generating evenly spaced points, calculate regression values for each scatter point
          const scatterPoints = baselineRegression.Data;
          const regressionPoints = scatterPoints.map(([x]) => {
            const y = a * x * x + b * x + c;
            return [x, y];
          });

          // Sort both arrays by x value to ensure proper line drawing
          scatterPoints.sort((a, b) => a[0] - b[0]);
          regressionPoints.sort((a, b) => a[0] - b[0]);

          return res.status(200).json({
            baselineDetails,
            regressionData: regressionStatic.regressionData,
            comparisonData: regressionStatic.comparisonData,
            chartData: {
              scatterData: scatterPoints,
              regressionLine: regressionPoints,
              unit: baselineRegression.Unit,
              caption: baselineRegression.Caption,
            },
          });
        }
        // If no feature provided, just return baseline details
        const details = await fetchBaselineDetails(Number(ebSgt));
        return res.status(200).json({ baselineDetails: details });
      }

      const data = await fetchENBData();
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
      });
    } catch (error) {
      console.error("API Error:", error);
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

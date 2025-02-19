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
  X1Unit?: string;
  X2Unit?: string;
  X3Unit?: string;
  X4Unit?: string;
  X5Unit?: string;
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

async function fetchENBData(company: string): Promise<ENBData[]> {
  try {
    // First try to get the ENB data
    const enbResponse = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineMain.ashx?schema=${company}&_search=false&rows=10000&page=1&sidx=EnergyBaselineName&sord=asc`
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
        X1Unit: row.UseX1 ? row.UnitX1 || "" : "",
        X2Unit: row.UseX2 ? row.UnitX2 || "" : "",
        X3Unit: row.UseX3 ? row.UnitX3 || "" : "",
        X4Unit: row.UseX4 ? row.UnitX4 || "" : "",
        X5Unit: row.UseX5 ? row.UnitX5 || "" : "",
        ebSgt: row.EbSgt,
      };
      // console.log("Transformed item:", result);
      return result;
    });

    // console.log("Final Transformed Data:", transformedData);
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
  // Add 8 hours for GMT+8
  date.setHours(date.getHours() + 8);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

async function fetchBaselineDetails(
  company: string,
  ebSgt: number
): Promise<BaselineData[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineDetail.ashx?schema=${company}&EbSgt=${ebSgt}&rows=10000&page=1&sidx=StartDate&sord=asc`
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
  company: string,
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
      `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineDetail.ashx?schema=${company}&selecttype=regressionstatic&EbSgt=${ebSgt}&Feature=${feature}`
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
  company: string,
  ebSgt: number,
  feature: string
): Promise<BaselineRegressionResponse> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineDetail.ashx?schema=${company}&selecttype=baselineregression&EbSgt=${ebSgt}&Feature=${feature}`
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
      const { company } = req.query;
      const ebSgt = req.query.ebSgt;
      const feature = req.query.feature;

      if (!company || typeof company !== "string") {
        return res.status(400).json({ message: "Company is required" });
      }

      if (ebSgt && !Array.isArray(ebSgt)) {
        if (feature && !Array.isArray(feature)) {
          // Fetch all required data
          const [regressionStatic, baselineDetails, baselineRegression] =
            await Promise.all([
              fetchRegressionStatic(company, Number(ebSgt), feature),
              fetchBaselineDetails(company, Number(ebSgt)),
              fetchBaselineRegression(company, Number(ebSgt), feature),
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
        const details = await fetchBaselineDetails(company, Number(ebSgt));
        return res.status(200).json({ baselineDetails: details });
      }

      const data = await fetchENBData(company);
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
  } else if (req.method === "POST") {
    try {
      const { company, ebSgt } = req.query;
      const formData = req.body;

      if (!company || typeof company !== "string") {
        return res.status(400).json({
          status: "error",
          code: "COMPANY_REQUIRED",
          message: "Company is required",
        });
      }

      // If ebSgt is in query params, this is a detail record operation
      if (ebSgt && !Array.isArray(ebSgt)) {
        // Validate required fields for detail
        if (!formData.date) {
          return res.status(400).json({
            status: "error",
            code: "DATE_REQUIRED",
            message: "期別為必填欄位",
          });
        }

        if (typeof formData.value !== "number") {
          return res.status(400).json({
            status: "error",
            code: "VALUE_REQUIRED",
            message: "監測值為必填欄位",
          });
        }

        // Prepare POST data for detail
        const postData = new URLSearchParams();
        postData.append("oper", formData.id ? "edit" : "add");
        postData.append("schema", company);
        postData.append("EbSgt", ebSgt);
        postData.append("StartDate", formData.date);
        postData.append("Value", formData.value.toString());
        postData.append("X1", formData.X1?.toString() || "");
        postData.append("X2", formData.X2?.toString() || "");
        postData.append("X3", formData.X3?.toString() || "");
        postData.append("X4", formData.X4?.toString() || "");
        postData.append("X5", formData.X5?.toString() || "");

        console.log(
          "Sending baseline detail data:",
          Object.fromEntries(postData)
        );

        const response = await fetch(
          `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineDetail.ashx`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: postData.toString(),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("External API error:", errorText);
          return res.status(response.status).json({
            status: "error",
            code: "EXTERNAL_API_ERROR",
            message: `Failed to ${
              formData.id ? "update" : "create"
            } baseline detail: ${errorText}`,
            details: {
              statusCode: response.status,
              errorText,
            },
          });
        }

        // Fetch updated baseline details
        const updatedDetails = await fetchBaselineDetails(
          company,
          Number(ebSgt)
        );
        return res.status(200).json({ baselineDetails: updatedDetails });
      }

      // Existing baseline creation/update code
      const sourceTypeCodeMap = {
        能源分類: "C",
        全公司: "A",
        工作場域: "M",
        設備群組: "G",
      } as const;

      type TargetItem = keyof typeof sourceTypeCodeMap;

      if (!formData.baselineCode) {
        return res.status(400).json({
          status: "error",
          code: "MISSING_BASELINE_CODE",
          message: "基線代碼為必填欄位",
        });
      }

      if (!formData.targetItem || !(formData.targetItem in sourceTypeCodeMap)) {
        return res.status(400).json({
          status: "error",
          code: "INVALID_TARGET_ITEM",
          message: "無效的標的選項",
        });
      }

      if (
        formData.targetItem === "能源分類" &&
        formData.energyType === "(未設定)"
      ) {
        return res.status(400).json({
          status: "error",
          code: "ENERGY_TYPE_REQUIRED",
          message: "能源分類需要選擇能源類型",
        });
      }

      if (
        formData.targetItem === "設備群組" &&
        formData.sharedGroup === "(未設定)"
      ) {
        return res.status(400).json({
          status: "error",
          code: "SHARED_GROUP_REQUIRED",
          message: "設備群組需要選擇共用群組",
        });
      }

      if (
        formData.targetItem === "工作場域" &&
        formData.workArea === "(未設定)"
      ) {
        return res.status(400).json({
          status: "error",
          code: "WORK_AREA_REQUIRED",
          message: "工作場域需要選擇工作區域",
        });
      }

      const postData = new URLSearchParams();
      postData.append("oper", formData.ebSgt ? "edit" : "add");
      postData.append("schema", company);
      postData.append("EnergyBaselineName", formData.baselineCode);
      postData.append(
        "SourceTypeCode",
        sourceTypeCodeMap[formData.targetItem as TargetItem]
      );
      postData.append("Remark", formData.note || "");
      postData.append(
        "EnergyTypeID",
        formData.energyType === "(未設定)" ? "" : formData.energyType
      );
      postData.append(
        "EnergyGroupID",
        formData.sharedGroup === "(未設定)" ? "" : formData.sharedGroup
      );
      postData.append(
        "EnergyAreaID",
        formData.workArea === "(未設定)" ? "" : formData.workArea
      );
      postData.append("EbSgt", formData.ebSgt ? formData.ebSgt.toString() : "");
      postData.append("IsLock", formData.locked === "鎖定" ? "true" : "false");

      for (let i = 1; i <= 5; i++) {
        const stateKey = `X${i}State` as keyof typeof formData;
        const valueKey = `X${i}` as keyof typeof formData;
        const unitKey = `X${i}Unit` as keyof typeof formData;
        const isUsed =
          formData[stateKey] ||
          (formData[valueKey] && formData[valueKey] !== "未使用");
        postData.append(`UseX${i}`, isUsed ? "true" : "false");
        postData.append(`CaptionX${i}`, isUsed ? formData[valueKey] : "");
        postData.append(`UnitX${i}`, isUsed ? formData[unitKey] || "" : "");
      }

      console.log("Sending request with data:", Object.fromEntries(postData));

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineMain.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: postData.toString(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("External API error:", errorText);
        return res.status(response.status).json({
          status: "error",
          code: "EXTERNAL_API_ERROR",
          message: `Failed to ${
            formData.ebSgt ? "update" : "create"
          } baseline: ${errorText}`,
          details: {
            statusCode: response.status,
            errorText,
          },
        });
      }

      const updatedData = await fetchENBData(company);
      return res.status(200).json(updatedData);
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        status: "error",
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        details:
          error instanceof Error
            ? {
                name: error.name,
                stack:
                  process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
              }
            : undefined,
      });
    }
  } else if (req.method === "DELETE") {
    try {
      const { company, ebSgt, date } = req.query;

      if (!company || typeof company !== "string") {
        return res.status(400).json({
          status: "error",
          code: "COMPANY_REQUIRED",
          message: "Company is required",
        });
      }

      if (!ebSgt || typeof ebSgt !== "string") {
        return res.status(400).json({
          status: "error",
          code: "EBSGT_REQUIRED",
          message: "Baseline ID (ebSgt) is required",
        });
      }

      if (!date || typeof date !== "string") {
        return res.status(400).json({
          status: "error",
          code: "DATE_REQUIRED",
          message: "Date is required for deletion",
        });
      }

      const postData = new URLSearchParams();
      postData.append("oper", "del");
      postData.append("schema", company);
      postData.append("EbSgt", ebSgt);
      postData.append("StartDate", date);

      console.log(
        "Sending delete request with data:",
        Object.fromEntries(postData)
      );

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyBaselineDetail.ashx?schema=${company}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: postData.toString(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("External API error:", errorText);
        return res.status(response.status).json({
          status: "error",
          code: "EXTERNAL_API_ERROR",
          message: `Failed to delete baseline detail: ${errorText}`,
          details: {
            statusCode: response.status,
            errorText,
          },
        });
      }

      // Small delay before fetching updated details
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch updated baseline details
      const updatedDetails = await fetchBaselineDetails(company, Number(ebSgt));
      return res.status(200).json({ baselineDetails: updatedDetails });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        status: "error",
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        details:
          error instanceof Error
            ? {
                name: error.name,
                stack:
                  process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
              }
            : undefined,
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

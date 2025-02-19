// src/pages/api/energy-review.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Report, Detail } from "@/lib/energy-review/types";

interface ApiResponse {
  reports?: Report[];
  details?: Detail[];
  message?: string;
  devices?: Device[];
  error?: string;
}

interface ApiReportResponse {
  page: number;
  total: number;
  records: number;
  rows: Array<{
    EeSgt: number;
    EnergyEstimateName: string;
    CreatedUserID: string;
    CreatedTime: string;
    UpdatedTime: string;
    StartDate: string;
    EndDate: string;
  }>;
}

interface ApiDetailResponse {
  page: number;
  total: number;
  records: number;
  rows: ApiDetailRow[];
}

interface ApiDetailRow {
  EeSgt: number;
  ItemNo: number;
  RowNo: number;
  SourceType: string;
  MachineID: string;
  EceSgt: number;
  EquipmentName: string;
  DayHours: number | null;
  UsedDays: number | null;
  LoadFactor: number;
  Quantity: number;
  UsedHours: number;
  KWHour: number;
  KW: number | null;
  RealConsumption: number;
  EnergyGroupName: string;
  EnergyAreaName: string;
  DepartName: string | null;
  StartDate: string;
  EndDate: string;
  DataQuality: number;
  PerfomanceLevel: number;
}

function transformDate(dateString: string): string {
  // Remove "/Date(" and ")/" and convert to number
  const timestamp = parseInt(dateString.replace(/\/Date\((\d+)\)\//, "$1"));
  // Create date in GMT+8
  const date = new Date(timestamp + 8 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

async function fetchReports(company: string): Promise<Report[]> {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateMain.ashx?_search=false&nd=${timestamp}&rows=10&page=1&sidx=EeSgt&sord=asc&schema=${company}`
    );
    const data: ApiReportResponse = await response.json();

    return data.rows.map((report) => ({
      reviewerId: report.CreatedUserID,
      title: report.EnergyEstimateName,
      startDate: transformDate(report.StartDate),
      endDate: transformDate(report.EndDate),
      eeSgt: report.EeSgt,
    }));
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
}

function transformDetailRow(row: ApiDetailRow): Detail {
  const performanceMap: Record<number, Detail["performanceEvaluation"]> = {
    1: "不合格",
    2: "正在改善中",
    3: "初評具潛力",
    4: "不確定",
  };

  return {
    id: row.ItemNo,
    name: row.EquipmentName,
    type: row.SourceType === "M" ? "生產設備" : "非生產設備",
    group: row.EnergyGroupName,
    area: row.EnergyAreaName,
    department: row.DepartName || "",
    workHours: row.DayHours || undefined,
    workDays: row.UsedDays || undefined,
    loadFactor: row.LoadFactor,
    quantity: row.Quantity,
    totalHours: row.UsedHours,
    kwPerHour: row.KWHour,
    actualEnergy: row.RealConsumption,
    actualConsumption: row.KW || undefined,
    startDate: row.StartDate,
    endDate: row.EndDate,
    dataQuality: row.DataQuality as 1 | 2 | 3,
    performanceEvaluation: performanceMap[row.PerfomanceLevel] || "不確定",
  };
}

async function fetchDetails(company: string, eeSgt: number): Promise<Detail[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?schema=${company}&EeSgt=${eeSgt}&rows=10000&page=1&sidx=EeSgt&sord=asc`
    );
    const data: ApiDetailResponse = await response.json();

    return data.rows.map(transformDetailRow);
  } catch (error) {
    console.error("Failed to fetch details:", error);
    return [];
  }
}

export interface Device {
  id: string;
  name: string;
  category: "生產設備" | "非生產設備";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query, body } = req;
  const { company, eeSgt, itemNo } = query;

  if (!company || typeof company !== "string") {
    return res.status(400).json({
      message: "Company is required",
    });
  }

  switch (method) {
    case "GET":
      // Get reports list if no eeSgt
      if (!eeSgt) {
        const reports = await fetchReports(company);
        return res.status(200).json({ reports });
      }

      // Get details for a specific report
      const details = await fetchDetails(company, Number(eeSgt));
      return res.status(200).json({ details });

    case "POST":
      try {
        const { eeSgt, detail } = body;

        if (!eeSgt) {
          return res.status(400).json({
            error: "EeSgt is required",
          });
        }

        // Map performance evaluation to number
        const performanceMap: Record<string, number> = {
          不合格: 1,
          正在改善中: 2,
          初評具潛力: 3,
          不確定: 4,
        };

        // Create form data for the POST request
        const formData = new URLSearchParams();
        formData.append("oper", "add");
        formData.append("schema", company);
        formData.append("EeSgt", eeSgt.toString());
        formData.append("SourceType", detail.type === "生產設備" ? "M" : "C");
        formData.append("MachineID", detail.equipmentCode || "");
        formData.append("EceSgt", detail.eceSgt?.toString() || "0");
        formData.append("DayHours", (detail.workHours || 0).toString());
        formData.append("UsedDays", (detail.workDays || 0).toString());
        formData.append("LoadFactor", (detail.loadFactor || 0).toString());
        formData.append("Quantity", (detail.quantity || 0).toString());
        formData.append("StartDate", detail.startDate || "");
        formData.append("EndDate", detail.endDate || "");
        formData.append("DataQuality", detail.dataQuality?.toString() || "2");
        formData.append(
          "PerfomanceLevel",
          (performanceMap[detail.performanceEvaluation] || 4).toString()
        );

        console.log(
          "Creating detail with form data:",
          Object.fromEntries(formData)
        );

        // Send POST request to create new detail
        const createResponse = await fetch(
          `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx`,
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
        const createResponseText = await createResponse.text();
        console.log("Create response:", createResponseText);

        if (!createResponse.ok) {
          throw new Error(`Failed to create detail: ${createResponseText}`);
        }

        // Fetch updated details list
        const updatedDetails = await fetchDetails(company, eeSgt);
        return res.status(200).json({ details: updatedDetails });
      } catch {
        return res.status(500).json({
          error: "Failed to create detail",
        });
      }

    case "PUT":
      try {
        const { eeSgt, itemNo, detail } = body;

        if (!eeSgt || !itemNo) {
          return res.status(400).json({
            error: "EeSgt and ItemNo are required",
          });
        }

        // Map performance evaluation to number
        const performanceMap: Record<string, number> = {
          不合格: 1,
          正在改善中: 2,
          初評具潛力: 3,
          不確定: 4,
        };

        // Create form data for the PUT request
        const formData = new URLSearchParams();
        formData.append("oper", "edit");
        formData.append("schema", company);
        formData.append("EeSgt", eeSgt.toString());
        formData.append("ItemNo", itemNo.toString());
        formData.append("SourceType", detail.type === "生產設備" ? "M" : "C");
        formData.append("MachineID", detail.equipmentCode);
        formData.append("EceSgt", detail.eceSgt.toString());
        formData.append("DayHours", (detail.workHours || 0).toString());
        formData.append("UsedDays", (detail.workDays || 0).toString());
        formData.append("LoadFactor", (detail.loadFactor || 0).toString());
        formData.append("Quantity", (detail.quantity || 0).toString());
        formData.append("StartDate", detail.startDate);
        formData.append("EndDate", detail.endDate);
        formData.append("DataQuality", detail.dataQuality.toString());
        formData.append(
          "PerfomanceLevel",
          performanceMap[detail.performanceEvaluation].toString()
        );

        // Send PUT request to update detail
        const updateResponse = await fetch(
          `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx`,
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
          throw new Error("Failed to update detail");
        }

        // Fetch updated details list
        const updatedDetails = await fetchDetails(company, eeSgt);
        return res.status(200).json({ details: updatedDetails });
      } catch {
        return res.status(500).json({
          error: "Failed to update detail",
        });
      }

    case "DELETE":
      try {
        if (!eeSgt || !itemNo) {
          return res.status(400).json({
            error: "EeSgt and ItemNo are required for deletion",
          });
        }

        // Create form data for deletion
        const formData = new URLSearchParams();
        formData.append("oper", "del");
        formData.append("schema", company);
        formData.append("EeSgt", eeSgt as string);
        formData.append("ItemNo", itemNo as string);

        // Send DELETE request
        const deleteResponse = await fetch(
          `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx`,
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
          throw new Error("Failed to delete detail");
        }

        // Fetch updated details list
        const updatedDetails = await fetchDetails(company, Number(eeSgt));
        return res.status(200).json({ details: updatedDetails });
      } catch {
        return res.status(500).json({
          error: "Failed to delete detail",
        });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

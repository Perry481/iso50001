// src/pages/api/energy-review.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Report, Detail } from "@/lib/energy-review/types";

interface ApiResponse {
  reports?: Report[];
  details?: Detail[];
  message?: string;
  devices?: Device[];
}

interface ApiReportResponse {
  EeSgt: number;
  EnergyEstimateName: string;
  CreatedUserID: string;
  CreatedTime: string;
  UpdatedTime: string;
  StartDate: string;
  EndDate: string;
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
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

async function fetchReports(): Promise<Report[]> {
  try {
    const response = await fetch(
      "http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=estimatereport"
    );
    const data: ApiReportResponse[] = await response.json();

    return data.map((report) => ({
      reviewerId: report.CreatedUserID,
      title: report.EnergyEstimateName,
      startDate: transformDate(report.StartDate),
      endDate: transformDate(report.EndDate),
      eeSgt: report.EeSgt, // Adding eeSgt to the report type
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

async function fetchDetails(eeSgt: number): Promise<Detail[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?EeSgt=${eeSgt}&rows=10000&page=1&sidx=EeSgt&sord=asc`
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
  const { method, query } = req;

  switch (method) {
    case "GET":
      // Get reports list
      if (!query.title) {
        const reports = await fetchReports();
        return res.status(200).json({ reports });
      }

      // Get specific report details
      const report = await fetchReports();
      const selectedReport = report.find((r) => r.title === query.title);
      if (!selectedReport) {
        return res.status(404).json({ message: "Report not found" });
      }

      const details = await fetchDetails(selectedReport.eeSgt);
      return res.status(200).json({ details });

    case "POST":
      // TODO: Implement report and detail creation
      return res.status(501).json({ message: "Not implemented" });

    case "PUT":
      // TODO: Implement report and detail update
      return res.status(501).json({ message: "Not implemented" });

    case "DELETE":
      // TODO: Implement report and detail deletion
      return res.status(501).json({ message: "Not implemented" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "devices"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

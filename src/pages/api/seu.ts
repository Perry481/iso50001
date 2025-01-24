import type { NextApiRequest, NextApiResponse } from "next";
import type { Report } from "@/components/dialogs/ReportDialog";

interface EnergyData {
  EnergyTypeID: string;
  name: string;
  value: number;
}

interface SEUEquipmentData {
  EceSgt: number;
  EquipmentName: string;
  IsSEU: boolean;
  KW: number;
  percentage: number;
}

interface MonthlyData {
  date: string;
  [key: string]: number | string; // Allow dynamic fields based on Title array
}

interface SEUStateData {
  equipmentName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
}

interface SEUGroupData {
  groupName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
}

interface ApiResponse {
  reports?: Report[];
  energyConsumption?: EnergyData[];
  energyEmission?: EnergyData[];
  equipmentConsumption?: EnergyData[];
  seuEquipmentData?: SEUEquipmentData[];
  monthlyData?: MonthlyData[];
  seuStateData?: SEUStateData[];
  seuGroupData?: SEUGroupData[];
  message?: string;
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

interface ApiSEUEquipmentResponse {
  SEUList: {
    EceSgt: number;
    EquipmentName: string;
    IsSEU: boolean;
    KW: number;
    Percentage: number;
  }[];
}

interface ApiGroupResponse {
  SEUList: {
    EnergyGroupID: string | null;
    EnergyGroupName: string | null;
    HasSEU: boolean | null;
    KW: number;
    Percentage: number;
  }[];
}

interface ApiWorkMonthResponse {
  Qty: number[][];
  Category: string[];
  Title: string[];
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
      eeSgt: report.EeSgt,
    }));
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
}

async function fetchEnergyConsumption(eeSgt: number): Promise<EnergyData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=energystatic&datatype=kw&eesgt=${eeSgt}`
    );
    const data: EnergyData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch energy consumption:", error);
    return [];
  }
}

async function fetchEnergyEmission(eeSgt: number): Promise<EnergyData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=energystatic&datatype=co2&eesgt=${eeSgt}`
    );
    const data: EnergyData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch energy emission:", error);
    return [];
  }
}

async function fetchSEUEquipmentData(
  eeSgt: number
): Promise<SEUEquipmentData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=equipmentstatic&eesgt=${eeSgt}`
    );
    const data: ApiSEUEquipmentResponse = await response.json();
    return data.SEUList.map((item) => ({
      EceSgt: item.EceSgt,
      EquipmentName: item.EquipmentName,
      IsSEU: item.IsSEU,
      KW: item.KW,
      percentage: item.Percentage,
    }));
  } catch (error) {
    console.error("Failed to fetch SEU equipment data:", error);
    return [];
  }
}

async function fetchSEUStateData(eeSgt: number): Promise<SEUStateData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=equipmentstatic&eesgt=${eeSgt}`
    );
    const data: ApiSEUEquipmentResponse = await response.json();
    return data.SEUList.map((item) => ({
      equipmentName: item.EquipmentName,
      KW: item.KW,
      percentage: item.Percentage,
      IsSEU: item.IsSEU,
      status: item.IsSEU ? undefined : "取消",
    }));
  } catch (error) {
    console.error("Failed to fetch SEU state data:", error);
    return [];
  }
}

async function fetchSEUGroupData(eeSgt: number): Promise<SEUGroupData[]> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=groupstatic&eesgt=${eeSgt}`
    );
    const data: ApiGroupResponse = await response.json();
    return data.SEUList.filter((item) => item.EnergyGroupName) // Filter out null group names
      .map((item) => ({
        groupName: item.EnergyGroupName!,
        KW: item.KW,
        percentage: item.Percentage,
        IsSEU: item.HasSEU ?? false,
        status: item.HasSEU ? undefined : "取消",
      }));
  } catch (error) {
    console.error("Failed to fetch SEU group data:", error);
    return [];
  }
}

async function fetchWorkMonthData(
  eeSgt: number,
  categoryType: string = "C"
): Promise<{
  equipmentConsumption: EnergyData[];
  monthlyData: MonthlyData[];
}> {
  try {
    const response = await fetch(
      `http://192.168.0.55:8080/SystemOptions/GetEnergyEstimateDetail.ashx?selecttype=workmonthstatic&eesgt=${eeSgt}&categorytype=${categoryType}`
    );
    const data: ApiWorkMonthResponse = await response.json();

    // Transform to equipment consumption format
    const equipmentConsumption: EnergyData[] = data.Title.slice(1).map(
      (name, index) => ({
        EnergyTypeID: (index + 1).toString(),
        name,
        value: data.Qty[index + 1].reduce((sum, val) => sum + (val || 0), 0),
      })
    );

    // Transform to monthly data format
    const monthlyData: MonthlyData[] = data.Category.map(
      (date, categoryIndex) => {
        const result: MonthlyData = { date };

        // For each title, get its corresponding Qty array and take the value at categoryIndex
        data.Title.forEach((title, titleIndex) => {
          const titleQtyArray = data.Qty[titleIndex];
          result[title] = titleQtyArray ? titleQtyArray[categoryIndex] || 0 : 0;
        });

        return result;
      }
    );

    console.log("Monthly Data:", monthlyData); // Debug log

    return { equipmentConsumption, monthlyData };
  } catch (error) {
    console.error("Failed to fetch work month data:", error);
    return {
      equipmentConsumption: [],
      monthlyData: [],
    };
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      // Get energy data
      if (query.type === "energy") {
        if (!query.eeSgt) {
          return res.status(400).json({ message: "eeSgt is required" });
        }
        const eeSgt = Number(query.eeSgt);
        const categoryType = (query.categoryType as string) || "C";

        // Fetch all data in parallel
        return Promise.all([
          fetchEnergyConsumption(eeSgt),
          fetchEnergyEmission(eeSgt),
          fetchSEUEquipmentData(eeSgt),
          fetchSEUStateData(eeSgt),
          fetchSEUGroupData(eeSgt),
          fetchWorkMonthData(eeSgt, categoryType),
        ]).then(
          ([
            energyConsumption,
            energyEmission,
            seuEquipmentData,
            seuStateData,
            seuGroupData,
            workMonthData,
          ]) =>
            res.status(200).json({
              energyConsumption,
              energyEmission,
              equipmentConsumption: workMonthData.equipmentConsumption,
              seuEquipmentData,
              monthlyData: workMonthData.monthlyData,
              seuStateData,
              seuGroupData,
            })
        );
      }
      // Get reports list
      return fetchReports().then((reports) =>
        res.status(200).json({ reports })
      );

    case "POST":
      // TODO: Implement report creation
      return res.status(501).json({ message: "Not implemented" });

    case "PUT":
      // TODO: Implement report update
      return res.status(501).json({ message: "Not implemented" });

    case "DELETE":
      // TODO: Implement report deletion
      return res.status(501).json({ message: "Not implemented" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

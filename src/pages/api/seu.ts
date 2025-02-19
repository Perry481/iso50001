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
  EceSgt: number;
}

interface SEUGroupData {
  groupName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
  groupId?: string;
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

interface AreaStaticResponse {
  Qty: number[];
  Category: string[];
}

interface ApiWorkMonthResponse {
  Title: string[];
  Category: string[];
  Qty: number[][];
}

function transformDate(dateString: string): string {
  // Remove "/Date(" and ")/" and convert to number
  const timestamp = parseInt(dateString.replace(/\/Date\((\d+)\)\//, "$1"));
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

async function fetchReports(company: string): Promise<Report[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=estimatereport&schema=${company}`
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

async function fetchEnergyConsumption(
  company: string,
  eeSgt: number
): Promise<EnergyData[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=energystatic&datatype=kw&eesgt=${eeSgt}&schema=${company}`
    );
    const data: EnergyData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch energy consumption:", error);
    return [];
  }
}

async function fetchEnergyEmission(
  company: string,
  eeSgt: number
): Promise<EnergyData[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=energystatic&datatype=co2&eesgt=${eeSgt}&schema=${company}`
    );
    const data: EnergyData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch energy emission:", error);
    return [];
  }
}

async function fetchSEUEquipmentData(
  company: string,
  eeSgt: number
): Promise<SEUEquipmentData[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=equipmentstatic&eesgt=${eeSgt}&schema=${company}`
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

async function fetchSEUStateData(
  company: string,
  eeSgt: number
): Promise<SEUStateData[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=equipmentstatic&eesgt=${eeSgt}&schema=${company}`
    );
    const data: ApiSEUEquipmentResponse = await response.json();
    return data.SEUList.map((item) => ({
      equipmentName: item.EquipmentName,
      KW: item.KW,
      percentage: item.Percentage,
      IsSEU: item.IsSEU,
      status: item.IsSEU ? undefined : "取消",
      EceSgt: item.EceSgt,
    }));
  } catch (error) {
    console.error("Failed to fetch SEU state data:", error);
    return [];
  }
}

async function fetchSEUGroupData(
  company: string,
  eeSgt: number
): Promise<SEUGroupData[]> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=groupstatic&eesgt=${eeSgt}&schema=${company}`
    );
    const data: ApiGroupResponse = await response.json();
    return data.SEUList.filter((item) => item.EnergyGroupName) // Filter out null group names
      .map((item) => ({
        groupName: item.EnergyGroupName!,
        KW: item.KW,
        percentage: item.Percentage,
        IsSEU: item.HasSEU ?? false,
        status: item.HasSEU ? undefined : "取消",
        groupId: item.EnergyGroupID || undefined,
      }));
  } catch (error) {
    console.error("Failed to fetch SEU group data:", error);
    return [];
  }
}

async function fetchWorkMonthData(
  company: string,
  eeSgt: number,
  categoryType: string = "C"
): Promise<{
  equipmentConsumption: EnergyData[];
  monthlyData: MonthlyData[];
}> {
  try {
    // Fetch area static data
    const areaResponse = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=areastatic&eesgt=${eeSgt}&categorytype=${categoryType}&schema=${company}`
    );
    const areaData: AreaStaticResponse = await areaResponse.json();

    // Fetch monthly data
    const monthlyResponse = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?selecttype=workmonthstatic&eesgt=${eeSgt}&categorytype=${categoryType}&schema=${company}`
    );
    const monthlyData: ApiWorkMonthResponse = await monthlyResponse.json();

    // Transform area data
    const equipmentConsumption: EnergyData[] = areaData.Category.map(
      (name, index) => ({
        EnergyTypeID: (index + 1).toString(),
        name,
        value: areaData.Qty[index],
      })
    );

    // Transform monthly data
    const transformedMonthlyData: MonthlyData[] = monthlyData.Title.map(
      (_, monthIndex) => {
        const monthData: MonthlyData = {
          date: monthlyData.Title[monthIndex],
        };
        monthlyData.Category.forEach((category, categoryIndex) => {
          monthData[category] = monthlyData.Qty[categoryIndex][monthIndex];
        });
        return monthData;
      }
    );

    return {
      equipmentConsumption,
      monthlyData: transformedMonthlyData,
    };
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
  const { company } = query;

  if (!company || typeof company !== "string") {
    return res.status(400).json({ message: "Company is required" });
  }

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
          fetchEnergyConsumption(company, eeSgt),
          fetchEnergyEmission(company, eeSgt),
          fetchSEUEquipmentData(company, eeSgt),
          fetchSEUStateData(company, eeSgt),
          fetchSEUGroupData(company, eeSgt),
          fetchWorkMonthData(company, eeSgt, categoryType),
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
      return fetchReports(company).then((reports) =>
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

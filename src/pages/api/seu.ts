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
}

interface MonthlyData {
  date: string;
  total: number;
  undefined: number;
  officialVehicles: number;
  autoPressMachine: number;
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

export const mockReports: Report[] = [
  {
    reviewerId: "21008",
    title: "2022審查報告",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
  },
  {
    reviewerId: "",
    title: "2023審查寶告",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  },
];

export const mockEnergyConsumption: EnergyData[] = [
  {
    EnergyTypeID: "401",
    name: "台電電力",
    value: 12893.26,
  },
  {
    EnergyTypeID: "104",
    name: "車用汽油",
    value: 9637.24,
  },
  {
    EnergyTypeID: "105",
    name: "柴油",
    value: 13284.46,
  },
];

export const mockEnergyEmission: EnergyData[] = [
  {
    EnergyTypeID: "104",
    name: "車用汽油",
    value: 22.6957,
  },
  {
    EnergyTypeID: "105",
    name: "柴油",
    value: 34.738863,
  },
  {
    EnergyTypeID: "401",
    name: "台電電力",
    value: 6.472417,
  },
];

export const mockEquipmentConsumption: EnergyData[] = [
  {
    EnergyTypeID: "1",
    name: "公務車(汽、柴油)",
    value: 22921.7,
  },
  {
    EnergyTypeID: "2",
    name: "自動壓蓋機",
    value: 10745.96,
  },
  {
    EnergyTypeID: "3",
    name: "未設定",
    value: 2147.3,
  },
];

export const mockSEUEquipmentData: SEUEquipmentData[] = [
  {
    EceSgt: 2,
    EquipmentName: "公務車_車牌號碼：BEJ-8651",
    IsSEU: true,
    KW: 13284.46,
  },
  {
    EceSgt: 1,
    EquipmentName: "公務車_車牌號碼：RDH-8539",
    IsSEU: true,
    KW: 9637.24,
  },
  {
    EceSgt: 7,
    EquipmentName: "3 JN03",
    IsSEU: true,
    KW: 5872.02,
  },
  {
    EceSgt: 6,
    EquipmentName: "2 ZERO-2",
    IsSEU: false,
    KW: 3393.95,
  },
  {
    EceSgt: 8,
    EquipmentName: "6 JN01SS-1",
    IsSEU: false,
    KW: 1425.09,
  },
  {
    EceSgt: 20,
    EquipmentName: "射出機401",
    IsSEU: false,
    KW: 817.41,
  },
  {
    EceSgt: 24,
    EquipmentName: "射出機405",
    IsSEU: false,
    KW: 333.42,
  },
  {
    EceSgt: 26,
    EquipmentName: "射出機410",
    IsSEU: false,
    KW: 324.83,
  },
  {
    EceSgt: 25,
    EquipmentName: "射出機407電錶",
    IsSEU: false,
    KW: 253.88,
  },
  {
    EceSgt: 21,
    EquipmentName: "射出機402",
    IsSEU: false,
    KW: 217.98,
  },
  {
    EceSgt: 23,
    EquipmentName: "射出機404",
    IsSEU: false,
    KW: 199.78,
  },
  {
    EceSgt: 12,
    EquipmentName: "121 SLQ-80A",
    IsSEU: false,
    KW: 54.9,
  },
];

export const mockMonthlyData: MonthlyData[] = [
  {
    date: "2022-01",
    total: 31853.66,
    undefined: 0,
    officialVehicles: 21107.7,
    autoPressMachine: 10745.96,
  },
  {
    date: "2024-03",
    total: 817.4,
    undefined: 817.4,
    officialVehicles: 0,
    autoPressMachine: 0,
  },
  {
    date: "2024-08",
    total: 1053.34,
    undefined: 1053.34,
    officialVehicles: 0,
    autoPressMachine: 0,
  },
  {
    date: "2024-09",
    total: 276.56,
    undefined: 276.56,
    officialVehicles: 0,
    autoPressMachine: 0,
  },
];

export const mockSEUStateData: SEUStateData[] = [
  {
    equipmentName:
      "RDH-8539999999999999999999999999999999999999999999999999999999999999",
    KW: 170755.71,
    percentage: 29.407878,
    IsSEU: true,
  },
  {
    equipmentName: "T5燈管",
    KW: 44820,
    percentage: 7.718987,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "2021年桌上型電腦(含螢幕)",
    KW: 40875.84,
    percentage: 7.039716,
    IsSEU: true,
  },
  {
    equipmentName: "機房冷氣",
    KW: 29127,
    percentage: 5.016308,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "立式同飲器",
    KW: 22995,
    percentage: 3.960243,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "空壓機(AER15A)",
    KW: 22410,
    percentage: 3.859493,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "空壓機(CSA20)",
    KW: 22410,
    percentage: 3.859493,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "機架式伺服器",
    KW: 19841.4,
    percentage: 3.417124,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "T8燈管",
    KW: 17230.8,
    percentage: 2.967521,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "123 SLQ-60X",
    KW: 14039.13,
    percentage: 2.417846,
    IsSEU: true,
    status: "取消",
  },
  {
    equipmentName: "BEJ-8651",
    KW: 13898.76,
    percentage: 2.393671,
    IsSEU: true,
  },
  {
    equipmentName: "製二熱風槍",
    KW: 9705.66,
    percentage: 1.671527,
    IsSEU: true,
  },
  {
    equipmentName: "平面LED",
    KW: 8142.3,
    percentage: 1.402282,
    IsSEU: true,
  },
  {
    equipmentName: "422 焊錫機(01)",
    KW: 6947.1,
    percentage: 1.196443,
    IsSEU: true,
  },
  {
    equipmentName: "空調機-7",
    KW: 6688.76,
    percentage: 1.151951,
    IsSEU: true,
  },
  {
    equipmentName: "空調機-4",
    KW: 6441.14,
    percentage: 1.109305,
    IsSEU: true,
  },
  {
    equipmentName: "121 SLQ-80A",
    KW: 6435.01,
    percentage: 1.108249,
    IsSEU: true,
  },
  {
    equipmentName: "122 SLQ-60A",
    KW: 5926.61,
    percentage: 1.020692,
    IsSEU: true,
  },
];

export const mockSEUGroupData: SEUGroupData[] = [
  {
    groupName: "公務車",
    KW: 184654.47,
    percentage: 31.80155,
    IsSEU: true,
    status: "取消",
  },
  {
    groupName: "機房",
    KW: 74702.4,
    percentage: 12.865391,
    IsSEU: true,
    status: "取消",
  },
  {
    groupName: "照明系統",
    KW: 70193.1,
    percentage: 12.088791,
    IsSEU: true,
    status: "取消",
  },
  {
    groupName: "空調系統",
    KW: 58789.27,
    percentage: 10.124801,
    IsSEU: true,
    status: "取消",
  },
  {
    groupName: "自動壓蓋機",
    KW: 57366.46,
    percentage: 9.879762,
    IsSEU: true,
  },
  {
    groupName: "空壓系統",
    KW: 44820,
    percentage: 7.718987,
    IsSEU: true,
    status: "取消",
  },
  {
    groupName: "空調系統",
    KW: 58789.27,
    percentage: 10.124801,
    IsSEU: true,
    status: "取消",
  },
  {
    groupName: "自動壓蓋機",
    KW: 57366.46,
    percentage: 9.879762,
    IsSEU: true,
  },
  {
    groupName: "空壓系統",
    KW: 44820,
    percentage: 7.718987,
    IsSEU: true,
    status: "取消",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      // Get energy data
      if (query.type === "energy") {
        return res.status(200).json({
          energyConsumption: mockEnergyConsumption,
          energyEmission: mockEnergyEmission,
          equipmentConsumption: mockEquipmentConsumption,
          seuEquipmentData: mockSEUEquipmentData,
          monthlyData: mockMonthlyData,
          seuStateData: mockSEUStateData,
          seuGroupData: mockSEUGroupData,
        });
      }
      // Get reports list
      return res.status(200).json({ reports: mockReports });

    case "POST":
      // Handle report creation
      if (req.body.type === "report") {
        const newReport = req.body.data as Report;
        mockReports.push(newReport);
        return res.status(201).json({ message: "Report created successfully" });
      }
      return res.status(400).json({ message: "Invalid request type" });

    case "PUT":
      // Handle report update
      if (req.body.type === "report") {
        const updatedReport = req.body.data as Report;
        const index = mockReports.findIndex(
          (r) => r.title === updatedReport.title
        );
        if (index !== -1) {
          mockReports[index] = updatedReport;
          return res
            .status(200)
            .json({ message: "Report updated successfully" });
        }
        return res.status(404).json({ message: "Report not found" });
      }
      return res.status(400).json({ message: "Invalid request type" });

    case "DELETE":
      // Handle report deletion
      const titleToDelete = query.title as string;
      const reportIndex = mockReports.findIndex(
        (r) => r.title === titleToDelete
      );
      if (reportIndex !== -1) {
        mockReports.splice(reportIndex, 1);
        return res.status(200).json({ message: "Report deleted successfully" });
      }
      return res.status(404).json({ message: "Report not found" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

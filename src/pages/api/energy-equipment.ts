import type { NextApiRequest, NextApiResponse } from "next";

export interface Equipment {
  id: string;
  code: string;
  name: string;
  referenceCode?: string;
  manufacturer: string;
  equipmentType: string;
  workArea: string;
  department: string;
  usageGroup: string;
  status: string;
  ratedPower?: number;
  actualPower?: number;
  powerUnit: string;
  assetNumber?: string;
  quantity: number;
  note?: string;
}

interface RawEquipment {
  EnergyEquipmentID: string;
  EnergyEquipmentName: string;
  EnergyTypeID: string;
  EnergyTypeName: string;
  UnitName: string;
  EnergyEquipmentTypeID: string;
  EnergyGroupID: string;
  EnergyGroupName: string;
  EnergyAreaID: string;
  EnergyAreaName: string;
  DepartName: string | null;
  ConsumptionRatio: number;
  AssetID: string | null;
  MachineID: string;
  Quantity: number;
  Remark: string;
  StatusType: number;
  RealConsumption: number | null;
}

interface ApiResponse {
  equipments?: Equipment[];
  equipment?: Equipment;
  message?: string;
}

// Keep mock data for reference
export const mockEquipments: Equipment[] = [
  {
    id: "101",
    code: "JN01-1",
    name: "自動壓著機",
    manufacturer: "日本",
    equipmentType: "生產設備",
    workArea: "生產區",
    department: "生產部",
    usageGroup: "壓著機",
    status: "正常",
    ratedPower: 2.2,
    actualPower: 1.8,
    powerUnit: "度",
    assetNumber: "A123456",
    quantity: 1,
  },
  {
    id: "102",
    code: "ZERO-2",
    name: "自動壓著機",
    referenceCode: "102",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "總廠",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "使用中",
    ratedPower: 1.5,
    powerUnit: "度",
    quantity: 1,
  },
  {
    id: "103",
    code: "JN03",
    name: "自動壓著機",
    referenceCode: "103",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "車用廠(1F)",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "使用中",
    ratedPower: 2.2,
    powerUnit: "度",
    quantity: 1,
  },
  {
    id: "109",
    code: "JN01SS-1",
    name: "自動壓著機",
    referenceCode: "109",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "總廠",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "使用中",
    ratedPower: 2.2,
    powerUnit: "度",
    assetNumber: "0002702",
    quantity: 1,
  },
];

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: "生產設備", label: "生產設備" },
  { value: "非生產設備", label: "非生產設備" },
];

export const STATUS_OPTIONS = [
  { value: "使用中", label: "使用中" },
  { value: "停用", label: "停用" },
  { value: "報廢", label: "報廢" },
];

function mapStatusType(statusType: number): string {
  switch (statusType) {
    case 1:
      return "使用中";
    case 2:
      return "停用";
    case 3:
      return "報廢";
    default:
      return "使用中";
  }
}

function mapEquipmentType(typeId: string): string {
  switch (typeId) {
    case "A":
      return "生產設備";
    case "C":
      return "非生產設備";
    default:
      return "生產設備";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const response = await fetch(
        "http://192.168.0.55:8080/SystemOptions/GetEnergyMachineList.ashx?rows=10000&page=1&sidx=EnergyEquipmentID&sord=asc",
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const equipments: Equipment[] = data.rows.map((item: RawEquipment) => ({
        id: item.EnergyEquipmentID,
        code: item.EnergyEquipmentID,
        name: item.EnergyEquipmentName,
        referenceCode: item.MachineID,
        manufacturer: item.EnergyTypeName,
        equipmentType: mapEquipmentType(item.EnergyEquipmentTypeID),
        workArea: item.EnergyAreaName,
        department: item.DepartName || "(未設定)",
        usageGroup: item.EnergyGroupName,
        status: mapStatusType(item.StatusType),
        ratedPower: item.ConsumptionRatio,
        actualPower: item.RealConsumption || undefined,
        powerUnit: item.UnitName,
        assetNumber: item.AssetID || undefined,
        quantity: item.Quantity,
        note: item.Remark || undefined,
      }));

      res.status(200).json({ equipments });
    } catch (error) {
      console.error("Failed to fetch equipments:", error);
      res.status(500).json({ message: "Failed to fetch equipments" });
    }
  } else if (req.method === "POST") {
    const equipment: Equipment = {
      id: String(Date.now()),
      ...req.body,
    };
    mockEquipments.push(equipment);
    res.status(201).json({ equipment });
  } else if (req.method === "PUT") {
    const { id, ...data } = req.body;
    const index = mockEquipments.findIndex((e) => e.id === id);
    if (index === -1) {
      res.status(404).json({ message: "Equipment not found" });
      return;
    }
    mockEquipments[index] = { ...mockEquipments[index], ...data };
    res.status(200).json({ equipment: mockEquipments[index] });
  } else if (req.method === "DELETE") {
    const { id } = req.body;
    const index = mockEquipments.findIndex((e) => e.id === id);
    if (index === -1) {
      res.status(404).json({ message: "Equipment not found" });
      return;
    }
    mockEquipments.splice(index, 1);
    res.status(200).json({ message: "Equipment deleted" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

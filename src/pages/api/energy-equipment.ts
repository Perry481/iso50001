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
    // TODO: Implement actual POST endpoint integration
    const equipment = req.body;
    res.status(201).json({ equipment });
  } else if (req.method === "PUT") {
    // TODO: Implement actual PUT endpoint integration
    const equipment = req.body;
    res.status(200).json({ equipment });
  } else if (req.method === "DELETE") {
    // TODO: Implement actual DELETE endpoint integration
    res.status(200).json({ message: "Equipment deleted" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

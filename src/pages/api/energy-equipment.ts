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
}

interface ApiResponse {
  equipments?: Equipment[];
  equipment?: Equipment;
  message?: string;
}

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
  { value: "非生產設備", label: "非生產設備" },
  { value: "生產設備", label: "生產設備" },
];

export const STATUS_OPTIONS = [
  { value: "使用中", label: "使用中" },
  { value: "報廢", label: "報廢" },
  { value: "停用", label: "停用" },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    res.status(200).json({ equipments: mockEquipments });
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

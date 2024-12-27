import type { NextApiRequest, NextApiResponse } from "next";
import type { Area } from "../area-settings";

interface ApiResponse {
  areas?: Area[];
  area?: Area;
  message?: string;
  departments?: { value: string; label: string }[];
}

export const DEPARTMENT_OPTIONS = [
  { value: "(未設定)", label: "(未設定)" },
  { value: "B10000", label: "業務處" },
  { value: "B10100", label: "業務一部" },
  { value: "B10200", label: "業務二部" },
  { value: "B10300", label: "業務發展部" },
  { value: "B10301", label: "業務開發部" },
  { value: "B10400", label: "業務開發部" },
  { value: "B11099", label: "國外業務" },
  { value: "B20000", label: "廠務處" },
  { value: "B20100", label: "製造一部" },
  { value: "B20110", label: "裁壓生產課" },
  { value: "B20120", label: "設備專案課" },
  { value: "B20130", label: "裁線生產課" },
  { value: "B20140", label: "物料管理組" },
  { value: "B20198", label: "製造一課自動組" },
  { value: "B20199", label: "製造一課裝配組" },
  { value: "B20200", label: "製造二部" },
  { value: "B20210", label: "手動課" },
  { value: "B20220", label: "裝配課" },
  { value: "B20299", label: "製造二課半自動組" },
  { value: "B20300", label: "製造三部" },
  { value: "B20310", label: "測試課" },
  { value: "B20320", label: "外製課" },
  { value: "B20400", label: "製造四部" },
  { value: "B20410", label: "前置加工課" },
  { value: "B20411", label: "前置加工組" },
  { value: "B20420", label: "成型課" },
  { value: "B20500", label: "製造五部" },
  { value: "B20510", label: "製造一課(五)" },
  { value: "B20520", label: "製造二課(五)" },
  { value: "B20530", label: "製造三課(五)" },
  { value: "B20540", label: "製造四課(五)" },
  { value: "B20700", label: "製造七部" },
  { value: "B20710", label: "製七課" },
  { value: "B20711", label: "製七組" },
  { value: "B20800", label: "生管部" },
  { value: "B20810", label: "成倉課" },
  { value: "B20900", label: "材料倉部" },
  { value: "B21000", label: "廠務二處" },
  { value: "B21500", label: "製造五部" },
  { value: "B21510", label: "製造一課" },
  { value: "B21520", label: "製造二課" },
  { value: "B21530", label: "製造三課" },
  { value: "B21540", label: "製造四課" },
  { value: "B21550", label: "生產技術課" },
  { value: "B22097", label: "製造六課(粗線組)" },
  { value: "B22098", label: "製造五課(四樓)" },
  { value: "B22099", label: "製造五課" },
  { value: "B30000", label: "品保處" },
  { value: "B30100", label: "品質管制部" },
  { value: "B30200", label: "實驗室" },
  { value: "B30300", label: "客戶服務課" },
  { value: "B30400", label: "供應商品質工程" },
  { value: "B30500", label: "系統維護課" },
  { value: "B30600", label: "綠色供應鏈" },
  { value: "B31100", label: "焊接組" },
  { value: "B31200", label: "電測課" },
  { value: "B40000", label: "採購部" },
  { value: "B40100", label: "成倉課" },
  { value: "B40200", label: "採購課" },
  { value: "B40300", label: "材料倉部" },
  { value: "B50000", label: "管理部" },
  { value: "B50100", label: "財務部" },
  { value: "B50200", label: "人資部" },
  { value: "B50300", label: "職安管理部" },
  { value: "B50310", label: "會計" },
  { value: "B50400", label: "總經理室" },
  { value: "B51000", label: "智慧管理處" },
  { value: "B51100", label: "資訊部" },
  { value: "B51200", label: "網路行銷部" },
  { value: "B51300", label: "智慧管理部" },
  { value: "B51400", label: "智動化部" },
  { value: "B51410", label: "自動化課" },
  { value: "B51420", label: "系統整合課" },
  { value: "B51500", label: "專案管理部" },
  { value: "B52000", label: "永續發展風險管理處" },
  { value: "B60000", label: "工程處" },
  { value: "B60100", label: "產品工程部" },
  { value: "B60110", label: "產品工程課" },
  { value: "B60120", label: "行政工程課" },
  { value: "B60200", label: "生技工程部" },
  { value: "B60210", label: "工務課" },
  { value: "B60220", label: "生技課" },
  { value: "B60230", label: "模具設計課" },
  { value: "B60298", label: "試樣組" },
  { value: "B60299", label: "生產技術課" },
  { value: "B60300", label: "專案管理部" },
];

export const mockAreas: Area[] = [
  {
    id: 1,
    code: "011",
    name: "總廠",
    department: "(未設定)",
    meterNumber: "總廠電表",
  },
  {
    id: 2,
    code: "501",
    name: "車用廠(1F)",
    department: "(未設定)",
  },
  {
    id: 3,
    code: "502",
    name: "車用廠(4F)",
    department: "(未設定)",
  },
  {
    id: 4,
    code: "601",
    name: "中興廠",
    department: "(未設定)",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      // If departments query parameter is present, return departments
      if (query.type === "departments") {
        return res.status(200).json({ departments: DEPARTMENT_OPTIONS });
      }
      // Otherwise return areas as before
      return res.status(200).json({ areas: mockAreas });

    case "POST":
      const newArea: Area = {
        ...req.body,
        id: mockAreas.length + 1,
      };
      mockAreas.push(newArea);
      return res.status(201).json({ area: newArea });

    case "PUT":
      const updatedArea = req.body;
      const index = mockAreas.findIndex((a) => a.id === updatedArea.id);
      if (index !== -1) {
        mockAreas[index] = updatedArea;
        return res.status(200).json({ area: updatedArea });
      }
      return res.status(404).json({ message: "Area not found" });

    case "DELETE":
      const idToDelete = query.id;
      const areaIndex = mockAreas.findIndex((a) => a.id === Number(idToDelete));
      if (areaIndex !== -1) {
        mockAreas.splice(areaIndex, 1);
        return res.status(200).json({ message: "Area deleted successfully" });
      }
      return res.status(404).json({ message: "Area not found" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

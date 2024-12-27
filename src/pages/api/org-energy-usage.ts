import type { NextApiRequest, NextApiResponse } from "next";
import type { EnergyUsage } from "../org-energy-usage";

interface ApiResponse {
  records?: EnergyUsage[];
  record?: EnergyUsage;
  message?: string;
}

export const mockRecords: EnergyUsage[] = [
  {
    id: 1,
    name: "公務車2021年汽油用量",
    categoryCode: "104",
    categoryName: "車用汽油",
    startDate: "2021-01-01",
    endDate: "2021-12-31",
    usage: 18826,
    unit: "公升",
    meterNumber: "車用汽油油單",
    note: "",
  },
  {
    id: 2,
    name: "公務車2022年汽油用量",
    categoryCode: "104",
    categoryName: "車用汽油",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    usage: 20200.64,
    unit: "公升",
    meterNumber: "車用汽油油單",
    note: "",
  },
  {
    id: 3,
    name: "公務車2021年柴油用量",
    categoryCode: "105",
    categoryName: "柴油",
    startDate: "2021-01-01",
    endDate: "2021-12-31",
    usage: 1423,
    unit: "公升",
    meterNumber: "車用柴油油單",
    note: "",
  },
  {
    id: 4,
    name: "公務車2022年柴油用量",
    categoryCode: "105",
    categoryName: "柴油",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    usage: 1539.72,
    unit: "公升",
    meterNumber: "車用柴油油單",
    note: "",
  },
  {
    id: 5,
    name: "總廠2021年用電",
    categoryCode: "401",
    categoryName: "台電電力",
    startDate: "2021-01-01",
    endDate: "2021-12-31",
    usage: 372280,
    unit: "度",
    meterNumber: "總廠電表",
    note: "",
  },
  {
    id: 6,
    name: "總廠2022年用電",
    categoryCode: "401",
    categoryName: "台電電力",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    usage: 318800,
    unit: "度",
    meterNumber: "總廠電表",
    note: "",
  },
  {
    id: 7,
    name: "車用廠區2021年總用電",
    categoryCode: "401",
    categoryName: "台電電力",
    startDate: "2021-01-01",
    endDate: "2021-12-31",
    usage: 180640,
    unit: "度",
    meterNumber: "車用電表",
    note: "",
  },
  {
    id: 8,
    name: "車用廠區2022年總用電",
    categoryCode: "401",
    categoryName: "台電電力",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    usage: 189080,
    unit: "度",
    meterNumber: "車用電表",
    note: "",
  },
  {
    id: 9,
    name: "中興廠區2022年總用電",
    categoryCode: "401",
    categoryName: "台電電力",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    usage: 34400,
    unit: "度",
    meterNumber: "中興廠區電表",
    note: "",
  },
  {
    id: 10,
    name: "2023年總廠總用電度數",
    categoryCode: "401",
    categoryName: "台電電力",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    usage: 287283,
    unit: "度",
    meterNumber: "總廠電表",
    note: "總廠總用電度數",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      return res.status(200).json({ records: mockRecords });

    case "POST":
      const newRecord: EnergyUsage = {
        ...req.body,
        id: mockRecords.length + 1,
      };
      mockRecords.push(newRecord);
      return res.status(201).json({ record: newRecord });

    case "PUT":
      const updatedRecord = req.body;
      const index = mockRecords.findIndex((r) => r.id === updatedRecord.id);
      if (index !== -1) {
        mockRecords[index] = updatedRecord;
        return res.status(200).json({ record: updatedRecord });
      }
      return res.status(404).json({ message: "Record not found" });

    case "DELETE":
      const idToDelete = query.id;
      const recordIndex = mockRecords.findIndex(
        (r) => r.id === Number(idToDelete)
      );
      if (recordIndex !== -1) {
        mockRecords.splice(recordIndex, 1);
        return res.status(200).json({ message: "Record deleted successfully" });
      }
      return res.status(404).json({ message: "Record not found" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

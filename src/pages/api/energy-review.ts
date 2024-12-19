// src/pages/api/energy-review.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Report, Detail } from "../../lib/energy-review/types";

interface ApiResponse {
  reports?: Report[];
  details?: Detail[];
  message?: string;
}

export const mockReports: Report[] = [
  {
    reviewerId: "18001",
    title: "2021審查報告",
    startDate: "2021-01-01",
    endDate: "2021-12-31",
  },
  {
    reviewerId: "18001",
    title: "2022審查報告",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
  },
  {
    reviewerId: "21108",
    title: "2023年能源審查(總廠)",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  },
  {
    reviewerId: "24007",
    title: "2022年能源審查(總廠)",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
  },
];

export const mockDetails: Record<string, Detail[]> = {
  "2021審查報告": [
    {
      id: 1,
      name: "2 ZERO-2",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 225.83,
      kwPerHour: 1.5,
      actualEnergy: 338.75,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 2,
      performanceEvaluation: "正在改善",
    },
    {
      id: 2,
      name: "3 JN03",
      type: "生產設備",
      group: "自動壓著機",
      area: "車用廠(1F)",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 213.76,
      kwPerHour: 2.2,
      actualEnergy: 470.27,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 2,
      performanceEvaluation: "正在改善",
    },
    {
      id: 3,
      name: "6 JN01SS-1",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 37.81,
      kwPerHour: 2.2,
      actualEnergy: 83.18,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 1,
      performanceEvaluation: "不確定",
    },
    {
      id: 4,
      name: "9 A3-1",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 211.74,
      kwPerHour: 2.3,
      actualEnergy: 487,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 1,
      performanceEvaluation: "不確定",
    },
    {
      id: 5,
      name: "10 A3-2",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 163.57,
      kwPerHour: 2.3,
      actualEnergy: 376.21,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 1,
      performanceEvaluation: "不確定",
    },
  ],
  "2022審查報告": [],
  "2023年能源審查(總廠)": [
    {
      id: 1,
      name: "2 ZERO-2",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 225.83,
      kwPerHour: 1.5,
      actualEnergy: 338.75,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 2,
      performanceEvaluation: "正在改善",
    },
    {
      id: 2,
      name: "3 JN03",
      type: "生產設備",
      group: "自動壓著機",
      area: "車用廠(1F)",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 213.76,
      kwPerHour: 2.2,
      actualEnergy: 470.27,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 2,
      performanceEvaluation: "正在改善",
    },
    {
      id: 3,
      name: "6 JN01SS-1",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 37.81,
      kwPerHour: 2.2,
      actualEnergy: 83.18,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 1,
      performanceEvaluation: "不確定",
    },
    {
      id: 4,
      name: "9 A3-1",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 211.74,
      kwPerHour: 2.3,
      actualEnergy: 487,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 1,
      performanceEvaluation: "不確定",
    },
    {
      id: 5,
      name: "10 A3-2",
      type: "生產設備",
      group: "自動壓著機",
      area: "總廠",
      department: "",
      workHours: 1,
      workDays: 1,
      dailyHours: undefined,
      workingDays: undefined,
      totalHours: 163.57,
      kwPerHour: 2.3,
      actualEnergy: 376.21,
      actualConsumption: undefined,
      startDate: "2022-01-01",
      endDate: "2022-01-31",
      dataQuality: 1,
      performanceEvaluation: "不確定",
    },
  ],
  "2022年能源審查(總廠)": [],
};
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      // Get reports list
      if (!query.title) {
        return res.status(200).json({ reports: mockReports });
      }
      // Get specific report details
      const reportTitle = query.title as string;
      const details = mockDetails[reportTitle] || [];
      return res.status(200).json({ details });

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
        delete mockDetails[titleToDelete];
        return res.status(200).json({ message: "Report deleted successfully" });
      }
      return res.status(404).json({ message: "Report not found" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

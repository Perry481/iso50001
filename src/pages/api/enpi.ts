import type { NextApiRequest, NextApiResponse } from "next";

interface IndicatorData {
  date: string;
  actualValue: number;
  theoreticalValue: number;
  maxDeviation: number;
  deviation: number;
  [key: string]: number | string | null;
}

interface Indicator {
  id: string;
  name: string;
  baselineCode: string;
  energyType: string;
  unit: string;
  startDate: string;
  frequency: "月" | "週";
  dataType: string;
  data: IndicatorData[];
}

interface ApiResponse {
  indicators?: Indicator[];
  energyTypes?: string[];
  frequencies?: string[];
  dataTypes?: string[];
  units?: string[];
  message?: string;
}

export const mockEnergyTypes = [
  "台電電力",
  "燃料油",
  "天然氣(自產)",
  "液化石油氣(LPG)",
  "車用汽油",
  "柴油",
  "外購蒸汽",
  "未設定",
];

export const mockFrequencies = ["月", "週", "日", "季"];
export const mockDataTypes = ["單一量測", "比率分析"];
export const mockUnits = ["度", "公升", "公斤", "立方公尺"];

export const mockIndicators: Indicator[] = [
  {
    id: "001",
    name: "19號1F（自動端子壓著機及空壓機）用電量(kwh)",
    baselineCode: "EnB-001_02-19號1F（自動端子壓著機及空壓機）用電量(kwh)",
    energyType: "台電電力",
    unit: "度",
    startDate: "2023-04-01",
    frequency: "月",
    dataType: "單一量測",
    data: [
      {
        date: "2023-04-01",
        actualValue: 5280,
        autoPress: 658.12,
        tempOver: 5,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 5470.98,
        maxDeviation: 18.04,
        deviation: -3.49,
      },
      {
        date: "2023-05-01",
        actualValue: 5920,
        autoPress: 792.42,
        tempOver: 17,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 6765.66,
        maxDeviation: 18.04,
        deviation: -12.5,
      },
      {
        date: "2023-06-01",
        actualValue: 6760,
        autoPress: 589.32,
        tempOver: 35,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 7623.67,
        maxDeviation: 18.04,
        deviation: -11.33,
      },
      {
        date: "2023-07-01",
        actualValue: 9120,
        autoPress: 829.39,
        tempOver: 52,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 9591.27,
        maxDeviation: 18.04,
        deviation: -4.91,
      },
    ],
  },
  {
    id: "002",
    name: "總廠網用電",
    baselineCode: "EnB-002_02_總廠網用電(kwh)",
    energyType: "台電電力",
    unit: "度",
    startDate: "2023-04-01",
    frequency: "月",
    dataType: "單一量測",
    data: [
      {
        date: "2023-04-01",
        actualValue: 17120,
        tempOver: 5,
        autoPress: 685.12,
        injection: 515.86,
        X4: null,
        X5: null,
        theoreticalValue: 16771.47,
        maxDeviation: 13.48,
        deviation: 2.08,
      },
      {
        date: "2023-05-01",
        actualValue: 20800,
        tempOver: 17,
        autoPress: 782.42,
        injection: 642.22,
        X4: null,
        X5: null,
        theoreticalValue: 22884.85,
        maxDeviation: 13.48,
        deviation: -9.11,
      },
      {
        date: "2023-06-01",
        actualValue: 28680,
        tempOver: 32,
        autoPress: 589.32,
        injection: 540.32,
        X4: null,
        X5: null,
        theoreticalValue: 31376.49,
        maxDeviation: 13.48,
        deviation: -8.59,
      },
      {
        date: "2023-07-01",
        actualValue: 33520,
        tempOver: 42,
        autoPress: 829.39,
        injection: 570.72,
        X4: null,
        X5: null,
        theoreticalValue: 38589.9,
        maxDeviation: 13.48,
        deviation: -13.14,
      },
    ],
  },
  {
    id: "003",
    name: "生管公務車ARJ-9205加油公升(L)",
    baselineCode: "EnB-003_02_生管公務車ARJ-9205加油公升(L)",
    energyType: "車用汽油",
    unit: "公升",
    startDate: "2022-10-03",
    frequency: "週",
    dataType: "單一量測",
    data: [
      {
        date: "2022-10-03",
        actualValue: 138.8,
        mileage: 1104.0,
        X1: 1104.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 142.81,
        maxDeviation: 25.36,
        deviation: -2.81,
      },
      {
        date: "2022-10-10",
        actualValue: 90.55,
        mileage: 814.0,
        X1: 814.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 108.4,
        maxDeviation: 25.36,
        deviation: -16.47,
      },
      {
        date: "2022-10-17",
        actualValue: 109.21,
        mileage: 939.0,
        X1: 939.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 123.23,
        maxDeviation: 25.36,
        deviation: -11.38,
      },
      {
        date: "2022-10-24",
        actualValue: 100.0,
        mileage: 690.0,
        X1: 690.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 93.68,
        maxDeviation: 25.36,
        deviation: 6.74,
      },
      {
        date: "2022-10-31",
        actualValue: 103.1,
        mileage: 862.0,
        X1: 862.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 114.09,
        maxDeviation: 25.36,
        deviation: -9.64,
      },
      {
        date: "2022-11-07",
        actualValue: 128.1,
        mileage: 1001.0,
        X1: 1001.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 130.59,
        maxDeviation: 25.36,
        deviation: -1.91,
      },
      {
        date: "2022-11-14",
        actualValue: 109.18,
        mileage: 823.0,
        X1: 823.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 109.47,
        maxDeviation: 25.36,
        deviation: -0.26,
      },
      {
        date: "2022-11-21",
        actualValue: 102.93,
        mileage: 890.0,
        X1: 890.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 117.42,
        maxDeviation: 25.36,
        deviation: -12.34,
      },
      {
        date: "2022-11-28",
        actualValue: 112.42,
        mileage: 710.0,
        X1: 710.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 96.06,
        maxDeviation: 25.36,
        deviation: 17.03,
      },
      {
        date: "2022-12-05",
        actualValue: 137.66,
        mileage: 1035.0,
        X1: 1035.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 134.62,
        maxDeviation: 25.36,
        deviation: 2.25,
      },
      {
        date: "2022-12-12",
        actualValue: 75.0,
        mileage: 580.0,
        X1: 580.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 80.63,
        maxDeviation: 25.36,
        deviation: -6.98,
      },
      {
        date: "2022-12-19",
        actualValue: 152.94,
        mileage: 1098.0,
        X1: 1098.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 142.1,
        maxDeviation: 25.36,
        deviation: 7.63,
      },
      {
        date: "2023-01-02",
        actualValue: 100.65,
        mileage: 764.0,
        X1: 764.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 102.47,
        maxDeviation: 25.36,
        deviation: -1.77,
      },
      {
        date: "2023-01-16",
        actualValue: 106.54,
        mileage: 940.0,
        X1: 940.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 123.35,
        maxDeviation: 25.36,
        deviation: -13.63,
      },
      {
        date: "2023-01-23",
        actualValue: 80.39,
        mileage: 616.0,
        X1: 616.0,
        X2: null,
        X3: null,
        X4: null,
        X5: null,
        theoreticalValue: 84.9,
        maxDeviation: 25.36,
        deviation: -5.31,
      },
    ],
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return res.status(200).json({
        indicators: mockIndicators,
        energyTypes: mockEnergyTypes,
        frequencies: mockFrequencies,
        dataTypes: mockDataTypes,
        units: mockUnits,
      });

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

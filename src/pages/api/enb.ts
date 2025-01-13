import { NextApiRequest, NextApiResponse } from "next";

interface ENBData {
  baselineCode: string;
  targetItem: string;
  energyType: string;
  workArea: string;
  sharedGroup: string;
  locked: string;
  note: string;
  X1: string;
  X2: string;
  X3?: string;
  X4?: string;
  X5?: string;
}

interface BaselineData {
  id: number;
  date: string;
  value: number;
  X1: number;
  X2?: number;
  X3?: number;
  X4?: number;
  X5?: number;
}

interface RegressionData {
  quadratic: {
    a: number;
    b: number;
    c: number;
    y: string;
    rSquare: number;
  };
  linear: {
    X1Label: string;
    X2Label: string;
    X3Label: string;
    X1Coefficient: number;
    X2Coefficient: number;
    X3Coefficient: number;
    constant: number;
    equation: string;
    rSquare: number;
    MBE: number;
    MBEPercentage: number;
    MAE: number;
    MAEPercentage: number;
    RMSE: number;
    CvRMSE: number;
    maxError: number;
  };
}

interface ChartData {
  Data: [number, number, number][];
  Unit: string;
  Caption: string;
}

interface BaselineDetails {
  baselineData: BaselineData[];
  regressionData: RegressionData;
  chartData: Record<string, ChartData>;
  comparisonData: {
    date: string;
    actualValue: number;
    theoreticalValue: number;
  }[];
}

interface ApiResponse {
  data: ENBData[];
  targetItems: string[];
  energyTypes: string[];
  workAreas: string[];
  sharedGroups: string[];
  lockedStates: string[];
  baselineDetails: Record<string, BaselineDetails>;
}

const mockENBData: ENBData[] = [
  {
    baselineCode: "EnB-003_02_生管公務車ARJ-9205加油公升(L)",
    targetItem: "能源分類",
    energyType: "車用汽油",
    workArea: "(未設定)",
    sharedGroup: "(未設定)",
    locked: "鎖定",
    note: "",
    X1: "使用里程數",
    X2: "未使用",
    X3: "未使用",
    X4: "未使用",
    X5: "未使用",
  },
  {
    baselineCode: "EnB-001_02-19號1F（自動端子壓著機及空壓機）用電量(kwh)",
    targetItem: "工作場域",
    energyType: "(未設定)",
    workArea: "車用廠(1F)",
    sharedGroup: "(未設定)",
    locked: "鎖定",
    note: "",
    X1: "使用自動壓著機",
    X2: "使用溫度超過28度",
    X3: "未使用",
    X4: "未使用",
    X5: "未使用",
  },
  {
    baselineCode: "EnB-002_02_總廠網用電(kwh)",
    targetItem: "全公司",
    energyType: "(未設定)",
    workArea: "(未設定)",
    sharedGroup: "(未設定)",
    locked: "鎖定",
    note: "",
    X1: "使用溫度超過28度",
    X2: "使用自動壓著機",
    X3: "使用射出機檢查",
    X4: "未使用",
    X5: "未使用",
  },
];

const mockBaselineDetails: Record<string, BaselineDetails> = {
  "EnB-003_02_生管公務車ARJ-9205加油公升(L)": {
    baselineData: [
      {
        id: 1,
        date: "2022-02-14",
        value: 95.45,
        X1: 866,
      },
      {
        id: 2,
        date: "2022-02-21",
        value: 110.44,
        X1: 904,
      },
      {
        id: 3,
        date: "2022-03-01",
        value: 49.2,
        X1: 456,
      },
      {
        id: 4,
        date: "2022-03-07",
        value: 87.68,
        X1: 591,
      },
      {
        id: 5,
        date: "2022-03-14",
        value: 96.63,
        X1: 785,
      },
      {
        id: 6,
        date: "2022-03-21",
        value: 107.32,
        X1: 770,
      },
      {
        id: 7,
        date: "2022-03-28",
        value: 100.86,
        X1: 691,
      },
      {
        id: 8,
        date: "2022-04-06",
        value: 55.07,
        X1: 468,
      },
      {
        id: 9,
        date: "2022-04-11",
        value: 106.09,
        X1: 702,
      },
      {
        id: 10,
        date: "2022-04-18",
        value: 75.59,
        X1: 538,
      },
      {
        id: 11,
        date: "2022-04-25",
        value: 97.02,
        X1: 703,
      },
      {
        id: 12,
        date: "2022-05-02",
        value: 76.22,
        X1: 596,
      },
    ],
    regressionData: {
      quadratic: {
        a: -8.064,
        b: 922.0993,
        c: 14827.471,
        y: "y = -8.064x^2 + 922.0993x + 14827.471",
        rSquare: 0.984,
      },
      linear: {
        X1Label: "X1 溫度超過24度天數",
        X2Label: "X2 自動壓著機稼動工時",
        X3Label: "X3 射出機稼動工時",
        X1Coefficient: 578.7519,
        X2Coefficient: 7.5047,
        X3Coefficient: -12.3602,
        constant: 15112.2625,
        equation: "Y = 578.7519*X1 + 7.5047*X2 + -12.3602*X3 + 15112.2625",
        rSquare: 0.9887,
        MBE: 7.84178458464642e-7,
        MBEPercentage: -0.43,
        MAE: 955.574268720711,
        MAEPercentage: 4.9117,
        RMSE: 1073.0053,
        CvRMSE: 4.4871,
        maxError: 13.48,
      },
    },
    chartData: {
      X1: {
        Data: [
          [140, 24.01, 16.444],
          [456, 49.2, 67.992],
          [468, 55.07, 69.409],
          [538, 75.59, 77.128],
          [542, 76.22, 77.557],
          [542, 76.82, 77.557],
          [583, 96.65, 81.814],
          [591, 87.68, 82.627],
          [605, 96.31, 83.997],
          [635, 79.42, 86.863],
          [638, 94.65, 87.145],
          [669, 99.75, 89.988],
          [691, 100.86, 91.918],
          [729, 113.83, 95.126],
          [739, 102.11, 95.944],
          [770, 107.32, 98.414],
          [785, 96.63, 99.589],
          [837, 102.09, 103.436],
          [904, 110.44, 107.898],
        ],
        Unit: "",
        Caption: "里程數",
      },
    },
    comparisonData: [
      { date: "2022-02-14", actualValue: 95.45, theoreticalValue: 114.57 },
      { date: "2022-02-21", actualValue: 110.44, theoreticalValue: 119.08 },
      { date: "2022-03-01", actualValue: 49.2, theoreticalValue: 65.92 },
      { date: "2022-03-07", actualValue: 87.68, theoreticalValue: 81.94 },
      { date: "2022-03-14", actualValue: 96.63, theoreticalValue: 104.96 },
      { date: "2022-03-21", actualValue: 107.32, theoreticalValue: 103.18 },
      { date: "2022-03-28", actualValue: 100.86, theoreticalValue: 93.8 },
      { date: "2022-04-06", actualValue: 55.07, theoreticalValue: 67.34 },
      { date: "2022-04-11", actualValue: 106.09, theoreticalValue: 95.11 },
      { date: "2022-04-18", actualValue: 75.59, theoreticalValue: 75.65 },
      { date: "2022-04-25", actualValue: 97.02, theoreticalValue: 95.23 },
      { date: "2022-05-02", actualValue: 76.22, theoreticalValue: 82.53 },
      { date: "2022-05-09", actualValue: 24.01, theoreticalValue: 28.42 },
      { date: "2022-05-16", actualValue: 99.75, theoreticalValue: 91.19 },
      { date: "2022-05-23", actualValue: 102.09, theoreticalValue: 111.13 },
      { date: "2022-06-06", actualValue: 79.42, theoreticalValue: 87.16 },
      { date: "2022-06-13", actualValue: 76.82, theoreticalValue: 76.12 },
      { date: "2022-06-20", actualValue: 113.83, theoreticalValue: 98.31 },
      { date: "2022-06-23", actualValue: 96.65, theoreticalValue: 80.99 },
      { date: "2022-07-04", actualValue: 102.11, theoreticalValue: 99.5 },
      { date: "2022-07-11", actualValue: 96.31, theoreticalValue: 83.6 },
      { date: "2022-07-19", actualValue: 94.65, theoreticalValue: 87.51 },
    ],
  },
  "EnB-001_02-19號1F（自動端子壓著機及空壓機）用電量(kwh)": {
    baselineData: [
      {
        id: 1,
        date: "2022-07-01",
        value: 45000,
        X1: 35,
        X2: 850.5,
      },
      {
        id: 2,
        date: "2022-08-01",
        value: 47500,
        X1: 38,
        X2: 875.2,
      },
    ],
    regressionData: {
      quadratic: {
        a: -5.234,
        b: 845.234,
        c: 12500.234,
        y: "y = -5.234x^2 + 845.234x + 12500.234",
        rSquare: 0.975,
      },
      linear: {
        X1Label: "使用自動壓著機",
        X2Label: "使用溫度超過28度",
        X3Label: "",
        X1Coefficient: 485.234,
        X2Coefficient: 5.234,
        X3Coefficient: 0,
        constant: 12500.234,
        equation: "Y = 485.234*X1 + 5.234*X2 + 12500.234",
        rSquare: 0.982,
        MBE: 5.23478e-7,
        MBEPercentage: -0.35,
        MAE: 845.234,
        MAEPercentage: 3.845,
        RMSE: 923.234,
        CvRMSE: 3.845,
        maxError: 11.23,
      },
    },
    chartData: {
      X1: {
        Data: [
          [35, 45000, 44800],
          [38, 47500, 47200],
        ],
        Unit: "",
        Caption: "使用自動壓著機",
      },
      X2: {
        Data: [
          [850.5, 45000, 44900],
          [875.2, 47500, 47300],
        ],
        Unit: "",
        Caption: "使用溫度超過28度",
      },
    },
    comparisonData: [],
  },
  "EnB-002_02_生管公務車ARJ-9205加油金額(元)": {
    baselineData: [
      {
        id: 1,
        date: "2022-07-01",
        value: 45000,
        X1: 35,
        X2: 850.5,
      },
      {
        id: 2,
        date: "2022-08-01",
        value: 47500,
        X1: 38,
        X2: 875.2,
      },
    ],
    regressionData: {
      quadratic: {
        a: -5.234,
        b: 845.234,
        c: 12500.234,
        y: "y = -5.234x^2 + 845.234x + 12500.234",
        rSquare: 0.975,
      },
      linear: {
        X1Label: "使用自動壓著機",
        X2Label: "使用溫度超過28度",
        X3Label: "",
        X1Coefficient: 485.234,
        X2Coefficient: 5.234,
        X3Coefficient: 0,
        constant: 12500.234,
        equation: "Y = 485.234*X1 + 5.234*X2 + 12500.234",
        rSquare: 0.982,
        MBE: 5.23478e-7,
        MBEPercentage: -0.35,
        MAE: 845.234,
        MAEPercentage: 3.845,
        RMSE: 923.234,
        CvRMSE: 3.845,
        maxError: 11.23,
      },
    },
    chartData: {
      X1: {
        Data: [
          [35, 45000, 44800],
          [38, 47500, 47200],
        ],
        Unit: "",
        Caption: "使用自動壓著機",
      },
      X2: {
        Data: [
          [850.5, 45000, 44900],
          [875.2, 47500, 47300],
        ],
        Unit: "",
        Caption: "使用溫度超過28度",
      },
    },
    comparisonData: [],
  },
};

const mockTargetItems = ["全公司", "能源分類", "設備群組", "工作場域"];

const mockEnergyTypes = [
  "燃料油",
  "天然氣(自產)",
  "液化石油氣(LPG)",
  "車用汽油",
  "柴油",
  "台電電力",
  "外購蒸汽",
  "(未設定)",
];

const mockWorkAreas = [
  "車用廠(1F)",
  "車用廠(4F)",
  "中興廠",
  "(未設定)",
  "總廠",
];

const mockSharedGroups = [
  "空壓系統",
  "自動壓著機",
  "裁線機",
  "射出機",
  "半自動壓著機",
  "烘料機",
  "電測機",
  "熱風槍",
  "焊接系統",
  "線材剝皮機",
  "(未設定)",
  "冰箱",
  "機房",
  "電梯",
  "標燈",
  "照明系統",
  "公務車",
  "飲水機",
  "空調系統",
  "筆記型電腦",
  "桌上型電腦",
  "除濕機",
  "影印機",
  "蒸飯箱",
  "微波爐",
];

const mockLockedStates = ["鎖定", "未鎖定"];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    res.status(200).json({
      data: mockENBData,
      targetItems: mockTargetItems,
      energyTypes: mockEnergyTypes,
      workAreas: mockWorkAreas,
      sharedGroups: mockSharedGroups,
      lockedStates: mockLockedStates,
      baselineDetails: mockBaselineDetails,
    });
  } else {
    res.status(405).end();
  }
}

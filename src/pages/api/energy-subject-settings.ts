import { NextApiRequest, NextApiResponse } from "next";

interface EnergySubject {
  EnergyGroupID: string;
  EnergyGroupName: string;
  Remark: string;
  CreatedTime: string | null;
  UpdatedTime: string | null;
}

const mockData: EnergySubject[] = [
  {
    EnergyGroupID: "001",
    EnergyGroupName: "冰箱",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228467087)/",
  },
  {
    EnergyGroupID: "002",
    EnergyGroupName: "機房",
    Remark: "伺服器+冷氣",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228342473)/",
  },
  {
    EnergyGroupID: "003",
    EnergyGroupName: "電梯",
    Remark: "19-1&21-1 電梯",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228729967)/",
  },
  {
    EnergyGroupID: "004",
    EnergyGroupName: "檯燈",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228440830)/",
  },
  {
    EnergyGroupID: "005",
    EnergyGroupName: "照明系統",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228434483)/",
  },
  {
    EnergyGroupID: "006",
    EnergyGroupName: "公務車",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228447547)/",
  },
  {
    EnergyGroupID: "007",
    EnergyGroupName: "飲水機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228453490)/",
  },
  {
    EnergyGroupID: "008",
    EnergyGroupName: "空調系統",
    Remark: "冷氣機+冷卻水塔系統",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228313690)/",
  },
  {
    EnergyGroupID: "009",
    EnergyGroupName: "筆記型電腦",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "010",
    EnergyGroupName: "桌上型電腦",
    Remark: "主機+螢幕",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "011",
    EnergyGroupName: "除濕機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "012",
    EnergyGroupName: "影印機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "013",
    EnergyGroupName: "蒸飯箱",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "014",
    EnergyGroupName: "微波爐",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "101",
    EnergyGroupName: "空壓系統",
    Remark: "空壓機+冷凍乾燥機",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228504303)/",
  },
  {
    EnergyGroupID: "102",
    EnergyGroupName: "自動壓著機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228567250)/",
  },
  {
    EnergyGroupID: "103",
    EnergyGroupName: "裁線機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228585850)/",
  },
  {
    EnergyGroupID: "104",
    EnergyGroupName: "射出機",
    Remark: "射出機+烘料",
    CreatedTime: null,
    UpdatedTime: "/Date(1710228634903)/",
  },
  {
    EnergyGroupID: "105",
    EnergyGroupName: "半自動壓著機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
  {
    EnergyGroupID: "106",
    EnergyGroupName: "烘料機",
    Remark: "",
    CreatedTime: null,
    UpdatedTime: null,
  },
];

let data = [...mockData];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      res.status(200).json(data);
      break;

    case "POST":
      const newItem = req.body;
      newItem.CreatedTime = new Date().toISOString();
      newItem.UpdatedTime = new Date().toISOString();
      data.push(newItem);
      res.status(201).json(newItem);
      break;

    case "PUT":
      const updatedItem = req.body;
      updatedItem.UpdatedTime = new Date().toISOString();
      data = data.map((item) =>
        item.EnergyGroupID === updatedItem.EnergyGroupID ? updatedItem : item
      );
      res.status(200).json(updatedItem);
      break;

    case "DELETE":
      const { id } = req.query;
      data = data.filter((item) => item.EnergyGroupID !== id);
      res.status(200).json({ message: "Deleted successfully" });
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

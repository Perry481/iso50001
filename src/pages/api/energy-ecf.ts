import type { NextApiRequest, NextApiResponse } from "next";
import type { ECF } from "@/lib/energy-ecf/types";

const mockECFs: ECF[] = [
  {
    id: "1",
    code: "101",
    name: "燃料油",
    unit: "公升",
    factor: 11.16,
    note: "9600/860=11.16",
  },
  {
    id: "2",
    code: "102",
    name: "天然氣(NG)自產",
    unit: "立方公尺",
    factor: 7.07,
    note: "6080/860=7.07",
  },
  {
    id: "3",
    code: "103",
    name: "液化石油氣(LPG)",
    unit: "公升",
    factor: 7.72,
    note: "6635/860=7.72",
  },
  {
    id: "4",
    code: "104",
    name: "車用汽油",
    unit: "公升",
    factor: 9.07,
    note: "7800/860=9.07",
  },
  {
    id: "5",
    code: "105",
    name: "柴油",
    unit: "公升",
    factor: 9.77,
    note: "8400/860=9.77",
  },
  {
    id: "6",
    code: "401",
    name: "台電電力",
    unit: "度",
    factor: 1,
    note: "860Kcal",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ecfs: ECF[] }>
) {
  res.status(200).json({ ecfs: mockECFs });
}

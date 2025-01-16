import { NextApiRequest, NextApiResponse } from "next";
import type { EnergySubject, RawApiResponse } from "@/lib/energy-subject/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnergySubject[] | { message: string }>
) {
  if (req.method === "GET") {
    try {
      const response = await fetch(
        "http://192.168.0.55:8080/SystemOptions/GetEnergyGroupList.ashx?rows=10000&page=1&sidx=EnergyGroupID&sord=asc",
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

      const data = (await response.json()) as RawApiResponse;
      res.status(200).json(data.rows);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

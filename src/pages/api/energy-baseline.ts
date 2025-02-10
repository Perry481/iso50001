import type { NextApiRequest, NextApiResponse } from "next";
import { energyBaselineService } from "@/lib/energy-baseline/service";
import type { EnergyBaseline } from "@/lib/energy-baseline/types";

interface ApiResponse {
  baselines?: EnergyBaseline[];
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    try {
      const baselines = await energyBaselineService.getBaselines();
      return res.status(200).json({ baselines });
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}

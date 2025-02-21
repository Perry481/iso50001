import type { NextApiRequest, NextApiResponse } from "next";

interface TestResponse {
  status: string;
  message: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  res.status(200).json({ status: "ok", message: "ISO50001 API is running" });
}

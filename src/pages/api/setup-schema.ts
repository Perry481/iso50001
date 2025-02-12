import type { NextApiRequest, NextApiResponse } from "next";

interface EsgServiceResponse {
  rint: number;
  data: null | unknown;
  erMsg: string;
}

type SchemaResponse = {
  success: boolean;
  message?: string;
  data?: EsgServiceResponse;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SchemaResponse>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { companyName } = req.body;

  if (!companyName) {
    return res
      .status(400)
      .json({ success: false, message: "Company name is required" });
  }

  try {
    const response = await fetch(
      `https://esg.jtmes.net/${companyName}/ESG/EsgService`
    );
    const data = await response.json();

    // Check if the schema setup was successful
    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: "Schema setup completed",
        data,
      });
    } else {
      return res.status(response.status).json({
        success: false,
        message: "Failed to setup schema",
        data,
      });
    }
  } catch (error) {
    console.error("Schema setup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during schema setup",
    });
  }
}

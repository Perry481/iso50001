import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const baseUrl = "http://192.168.0.55:8080/SystemOptions";

  try {
    // Log the incoming request
    console.log("Request Method:", req.method);
    console.log("Request Body:", req.body);
    console.log("Request Query:", req.query);

    if (req.method === "GET") {
      // Fetch baseline list - this one we can actually do since it's just reading
      const response = await fetch(
        `${baseUrl}/GetEnergyPerformanceIndex.ashx?selecttype=baselinelist&timestamp=${Date.now()}`,
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      // Test add operation - just log what would be sent
      console.log("Would send POST request with:");
      console.log(
        "URL:",
        `${baseUrl}/GetEnergyPerformanceIndex.ashx?selecttype=add&timestamp=${Date.now()}`
      );
      console.log(
        "Body data that would be sent:",
        new URLSearchParams(req.body).toString()
      );

      // Return mock success response
      return res.status(200).json({
        success: true,
        message: "Test POST request logged (no actual data added)",
        requestBody: req.body,
      });
    }

    if (req.method === "PUT") {
      // Test edit operation - just log what would be sent
      console.log("Would send PUT request with:");
      console.log(
        "URL:",
        `${baseUrl}/GetEnergyPerformanceIndex.ashx?selecttype=edit&timestamp=${Date.now()}`
      );
      console.log(
        "Body data that would be sent:",
        new URLSearchParams(req.body).toString()
      );

      // Return mock success response
      return res.status(200).json({
        success: true,
        message: "Test PUT request logged (no actual data modified)",
        requestBody: req.body,
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

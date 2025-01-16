import type { NextApiRequest, NextApiResponse } from "next";

interface DeptOption {
  value: string;
  label: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ depts: DeptOption[] }>
) {
  try {
    const response = await fetch(
      "http://192.168.0.55:8080/SystemOptions/GetEnergyAreaList.ashx?selecttype=deptlist",
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

    const rawData = await response.json();

    // Transform the object into array of options
    const depts: DeptOption[] = [
      { value: "(未設定)", label: "(未設定)" },
      ...Object.entries(rawData).map(([deptId, deptName]) => ({
        value: deptId,
        label: deptName as string,
      })),
    ];

    res.status(200).json({ depts });
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    res.status(500).json({ depts: [{ value: "(未設定)", label: "(未設定)" }] });
  }
}

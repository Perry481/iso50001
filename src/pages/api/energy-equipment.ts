import type { NextApiRequest, NextApiResponse } from "next";

export interface Equipment {
  id: string;
  code: string;
  name: string;
  referenceCode?: string;
  manufacturer: string;
  manufacturerName: string;
  equipmentType: string;
  workArea: string;
  workAreaName: string;
  department: string;
  usageGroup: string;
  usageGroupName: string;
  status: string;
  ratedPower?: number;
  actualPower?: number;
  powerUnit: string;
  assetNumber?: string;
  quantity: number;
  note?: string;
  EceSgt?: number;
  machineId: string;
  area: string;
  group: string;
  kw: number;
}

interface RawEquipment {
  EceSgt: number;
  EnergyEquipmentID: string;
  EnergyEquipmentName: string;
  EnergyTypeID: string;
  EnergyTypeName: string;
  UnitName: string;
  EnergyEquipmentTypeID: string;
  EnergyGroupID: string;
  EnergyGroupName: string;
  EnergyAreaID: string;
  EnergyAreaName: string;
  DepartName: string | null;
  ConsumptionRatio: number;
  AssetID: string | null;
  MachineID: string;
  Quantity: number;
  Remark: string;
  StatusType: number;
  RealConsumption: number | null;
}

interface ApiResponse {
  equipments?: Equipment[];
  equipment?: Equipment;
  message?: string;
  error?: string;
}

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: "生產設備", label: "生產設備" },
  { value: "非生產設備", label: "非生產設備" },
];

export const STATUS_OPTIONS = [
  { value: "使用中", label: "使用中" },
  { value: "停用", label: "停用" },
  { value: "報廢", label: "報廢" },
];

function mapStatusType(statusType: number): string {
  switch (statusType) {
    case 1:
      return "使用中";
    case 2:
      return "停用";
    case 3:
      return "報廢";
    default:
      return "使用中";
  }
}

function mapStatusTypeReverse(status: string): number {
  switch (status) {
    case "使用中":
      return 1;
    case "停用":
      return 2;
    case "報廢":
      return 3;
    default:
      return 1;
  }
}

function mapEquipmentType(typeId: string): string {
  switch (typeId) {
    case "A":
      return "生產設備";
    case "C":
      return "非生產設備";
    default:
      return "生產設備";
  }
}

function mapEquipmentTypeReverse(type: string): string {
  switch (type) {
    case "生產設備":
      return "A";
    case "非生產設備":
      return "C";
    default:
      return "A";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { company } = req.query;

    if (!company) {
      return res.status(400).json({
        message: "Company is required",
      });
    }

    // Handle GET request - fetch all equipments
    if (req.method === "GET") {
      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx?schema=${company}&rows=2000&page=1&sidx=EnergyEquipmentID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const equipments: Equipment[] = data.rows.map((item: RawEquipment) => ({
        id: item.EnergyEquipmentID,
        code: item.EnergyEquipmentID,
        name: item.EnergyEquipmentName,
        referenceCode: item.MachineID,
        manufacturer: item.EnergyTypeID,
        manufacturerName: item.EnergyTypeName,
        equipmentType: mapEquipmentType(item.EnergyEquipmentTypeID),
        workArea: item.EnergyAreaID,
        workAreaName: item.EnergyAreaName,
        department: item.DepartName || "(未設定)",
        usageGroup: item.EnergyGroupID,
        usageGroupName: item.EnergyGroupName,
        status: mapStatusType(item.StatusType),
        ratedPower: item.ConsumptionRatio,
        actualPower: item.RealConsumption || undefined,
        powerUnit: item.UnitName,
        assetNumber: item.AssetID || undefined,
        quantity: item.Quantity,
        note: item.Remark || undefined,
        EceSgt: item.EceSgt,
        machineId: item.EnergyEquipmentID,
        area: item.EnergyAreaName,
        group: item.EnergyGroupName,
        kw: item.ConsumptionRatio,
      }));

      return res.status(200).json({ equipments });
    }

    // Handle POST request - create new equipment
    if (req.method === "POST") {
      // Get the latest EceSgt value
      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx?schema=${company}&rows=2000&page=1&sidx=EnergyEquipmentID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const latestEceSgt =
        Math.max(...data.rows.map((item: RawEquipment) => item.EceSgt)) + 1;

      const {
        code,
        name,
        referenceCode,
        manufacturer,
        equipmentType,
        workArea,
        department,
        usageGroup,
        status,
        ratedPower,
        powerUnit,
        assetNumber,
        quantity,
        note,
        actualPower,
      } = req.body;

      // Validate required fields
      if (
        !code ||
        !name ||
        !manufacturer ||
        !equipmentType ||
        !workArea ||
        !department ||
        !usageGroup ||
        !status ||
        !powerUnit ||
        !quantity
      ) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // Create form data for the POST request
      const formData = new URLSearchParams();
      formData.append("oper", "add");
      formData.append("schema", company as string);
      formData.append("EnergyEquipmentID", code);
      formData.append("EnergyEquipmentName", name);
      formData.append("MachineID", referenceCode || "");
      formData.append("EnergyTypeID", manufacturer);
      formData.append("EnergyTypeName", "");
      formData.append("UnitName", powerUnit);
      formData.append("InventoryCategoryID", "0");
      formData.append(
        "EnergyEquipmentTypeID",
        mapEquipmentTypeReverse(equipmentType)
      );
      formData.append("EnergyGroupID", usageGroup);
      formData.append("EnergyAreaID", workArea);
      formData.append("DepartID", department);
      formData.append("ConsumptionRatio", ratedPower?.toString() || "0");
      formData.append("AssetID", assetNumber || "");
      formData.append("Quantity", quantity.toString());
      formData.append("Remark", note || "");
      formData.append("StatusType", mapStatusTypeReverse(status).toString());
      formData.append("EceSgt", latestEceSgt.toString());
      formData.append("IsSEU", "false");
      formData.append("RealConsumption", actualPower?.toString() || "0");

      console.log("Create form data:", formData.toString());

      const createResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        throw new Error(`Failed to create equipment: ${errorData}`);
      }
    }

    // Handle PUT request - update equipment
    if (req.method === "PUT") {
      const {
        id,
        code,
        name,
        referenceCode,
        manufacturer,
        equipmentType,
        workArea,
        department,
        usageGroup,
        status,
        ratedPower,
        powerUnit,
        assetNumber,
        quantity,
        note,
        EceSgt,
        actualPower,
      } = req.body;

      console.log("Edit request received:", {
        id,
        code,
        name,
        manufacturer,
        equipmentType,
        workArea,
        department,
        usageGroup,
        status,
        EceSgt,
      });

      // Validate required fields
      if (
        !id ||
        !code ||
        !name ||
        !manufacturer ||
        !equipmentType ||
        !workArea ||
        !department ||
        !usageGroup ||
        !status ||
        !powerUnit ||
        !quantity
      ) {
        const missingFields = [
          !id && "id",
          !code && "code",
          !name && "name",
          !manufacturer && "manufacturer",
          !equipmentType && "equipmentType",
          !workArea && "workArea",
          !department && "department",
          !usageGroup && "usageGroup",
          !status && "status",
          !powerUnit && "powerUnit",
          !quantity && "quantity",
        ].filter(Boolean);

        console.log("Missing required fields:", missingFields);
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Create form data for the PUT request
      const formData = new URLSearchParams();
      formData.append("oper", "edit");
      formData.append("schema", company as string);
      formData.append("id", code);
      formData.append("EnergyEquipmentID", code);
      formData.append("EnergyEquipmentName", name);
      formData.append("MachineID", referenceCode || "");
      formData.append("EnergyTypeID", manufacturer);
      formData.append("EnergyTypeName", "");
      formData.append("UnitName", powerUnit);
      formData.append("InventoryCategoryID", "0");
      formData.append(
        "EnergyEquipmentTypeID",
        mapEquipmentTypeReverse(equipmentType)
      );
      formData.append("EnergyGroupID", usageGroup);
      formData.append("EnergyAreaID", workArea);
      formData.append("DepartID", department);
      formData.append("ConsumptionRatio", ratedPower?.toString() || "0");
      formData.append("AssetID", assetNumber || "");
      formData.append("Quantity", quantity.toString());
      formData.append("Remark", note || "");
      formData.append("StatusType", mapStatusTypeReverse(status).toString());
      formData.append("EceSgt", EceSgt?.toString() || "0");
      formData.append("IsSEU", "false");
      formData.append("RealConsumption", actualPower?.toString() || "0");

      console.log("Update form data:", Object.fromEntries(formData));

      const updateResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      console.log("Update response status:", updateResponse.status);
      const updateResponseText = await updateResponse.text();
      console.log("Update response text:", updateResponseText);

      if (!updateResponse.ok) {
        throw new Error(`Failed to update equipment: ${updateResponseText}`);
      }
    }

    // Handle DELETE request
    if (req.method === "DELETE") {
      const { id } = req.query;
      console.log("Delete request received:", { id, company });

      if (!id) {
        return res.status(400).json({
          error: "Equipment ID is required for deletion",
        });
      }

      // First, fetch the equipment to get its EceSgt
      const getResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx?schema=${company}&rows=2000&page=1&sidx=EnergyEquipmentID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!getResponse.ok) {
        throw new Error(`HTTP error! status: ${getResponse.status}`);
      }

      const data = await getResponse.json();
      const equipment = data.rows.find(
        (item: RawEquipment) => item.EnergyEquipmentID === id
      );

      if (!equipment) {
        throw new Error(`Equipment with ID ${id} not found`);
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", company as string);
      formData.append("EnergyEquipmentID", id as string);
      formData.append("id", id as string);
      formData.append("EceSgt", equipment.EceSgt.toString());

      console.log("Delete form data:", Object.fromEntries(formData));

      const deleteResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      console.log("Delete response status:", deleteResponse.status);
      const deleteResponseText = await deleteResponse.text();
      console.log("Delete response text:", deleteResponseText);

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete equipment: ${deleteResponseText}`);
      }
    }

    // For POST, PUT, and DELETE, fetch the updated list after the operation
    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyMachineList.ashx?schema=${company}&rows=2000&page=1&sidx=EnergyEquipmentID&sord=asc`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await updatedResponse.json();
      const equipments: Equipment[] = data.rows.map((item: RawEquipment) => ({
        id: item.EnergyEquipmentID,
        code: item.EnergyEquipmentID,
        name: item.EnergyEquipmentName,
        referenceCode: item.MachineID,
        manufacturer: item.EnergyTypeID,
        manufacturerName: item.EnergyTypeName,
        equipmentType: mapEquipmentType(item.EnergyEquipmentTypeID),
        workArea: item.EnergyAreaID,
        workAreaName: item.EnergyAreaName,
        department: item.DepartName || "(未設定)",
        usageGroup: item.EnergyGroupID,
        usageGroupName: item.EnergyGroupName,
        status: mapStatusType(item.StatusType),
        ratedPower: item.ConsumptionRatio,
        actualPower: item.RealConsumption || undefined,
        powerUnit: item.UnitName,
        assetNumber: item.AssetID || undefined,
        quantity: item.Quantity,
        note: item.Remark || undefined,
        EceSgt: item.EceSgt,
        machineId: item.EnergyEquipmentID,
        area: item.EnergyAreaName,
        group: item.EnergyGroupName,
        kw: item.ConsumptionRatio,
      }));

      return res.status(200).json({ equipments });
    }

    return res.status(405).json({
      message: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
}

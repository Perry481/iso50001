"use client";

import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "../components/DataGrid";
import { ListingPage } from "../components/ListingPage";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Field } from "../components/dialogs/DetailDialog";
import { ReportDialog, type Report } from "../components/dialogs/ReportDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import type { Detail } from "@/lib/energy-review/types";
import type { Equipment } from "@/lib/energy-equipment/types";
import { DetailCheckboxDialog } from "../components/dialogs/DetailCheckboxDialog";
import { useCompany } from "../contexts/CompanyContext";

const PERFORMANCE_EVALUATION_OPTIONS = [
  { value: "不合格", label: "不合格" },
  { value: "正在改善中", label: "正在改善中" },
  { value: "初評具潛力", label: "初評具潛力" },
  { value: "不確定", label: "不確定" },
];

const DATA_QUALITY_OPTIONS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
];

const tooltipProps = {
  arrow: true,
  placement: "top" as const,
  enterDelay: 0,
  leaveDelay: 0,
  enterTouchDelay: 0,
  TransitionProps: { timeout: 0 },
  PopperProps: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -8],
        },
      },
    ],
  },
  componentsProps: {
    tooltip: {
      sx: {
        bgcolor: "rgba(97, 97, 97, 0.8)",
        "& .MuiTooltip-arrow": {
          color: "rgba(97, 97, 97, 0.8)",
        },
        padding: "8px 12px",
        fontSize: "0.95rem",
        fontWeight: 400,
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        minWidth: "80px",
        textAlign: "center",
        transform: "none",
      },
    },
  },
};

interface ApiDetailResponse {
  page: number;
  total: number;
  records: number;
  rows: Array<{
    EeSgt: number;
    ItemNo: number;
    RowNo: number;
    SourceType: "M" | "C";
    MachineID: string | null;
    EceSgt: number;
    EquipmentName: string;
    DayHours: number | null;
    UsedDays: number | null;
    LoadFactor: number;
    Quantity: number;
    UsedHours: number | null;
    KWHour: number;
    RealConsumption: number | null;
    KW: number | null;
    EnergyGroupName: string;
    EnergyAreaName: string;
    DepartName: string | null;
    StartDate: string | null;
    EndDate: string | null;
    DataQuality: 1 | 2 | 3;
    PerfomanceLevel: 1 | 2 | 3 | 4;
  }>;
}

export default function EnergyReview() {
  const [reports, setReports] = useState<Report[]>([]);
  const [details, setDetails] = useState<Detail[]>([]);
  const [showReportList, setShowReportList] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailCheckboxDialogOpen, setDetailCheckboxDialogOpen] =
    useState(false);
  const [editingReport, setEditingReport] = useState<Report | undefined>();
  const [editingDetail, setEditingDetail] = useState<Detail | undefined>();
  const [deleteReportConfirm, setDeleteReportConfirm] = useState<Report | null>(
    null
  );
  const [deleteDetailConfirm, setDeleteDetailConfirm] = useState<Detail | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { companyName, isSchemaInitialized } = useCompany();

  const detailFields = useMemo<Field[]>(
    () =>
      [
        {
          key: "name",
          label: "名稱",
          type: "text",
          required: true,
          disabled: Boolean(editingDetail?.id),
        },
        !editingDetail?.id && {
          key: "type",
          label: "設備類型",
          type: "text",
        },
        !editingDetail?.id && {
          key: "group",
          label: "群組",
          type: "text",
        },
        !editingDetail?.id && {
          key: "area",
          label: "場域",
          type: "text",
        },
        !editingDetail?.id && {
          key: "department",
          label: "部門",
          type: "text",
        },
        {
          key: "workHours",
          label: "每日時數",
          type: "number",
        },
        {
          key: "workDays",
          label: "工作天數",
          type: "number",
        },
        {
          key: "loadFactor",
          label: "負載係數",
          type: "number",
        },
        {
          key: "quantity",
          label: "數量",
          type: "number",
        },
        {
          key: "totalHours",
          label: "總時數",
          type: "number",
        },
        !editingDetail?.id && {
          key: "kwPerHour",
          label: "每小時耗電量",
          type: "number",
          disabled: Boolean(editingDetail?.id),
        },
        !editingDetail?.id && {
          key: "actualEnergy",
          label: "實際耗電量",
          type: "number",
        },
        // !editingDetail?.id && {
        //   key: "actualConsumption",
        //   label: "實際能耗",
        //   type: "number",
        // },
        {
          key: "startDate",
          label: "開始日期",
          type: "date",
        },
        {
          key: "endDate",
          label: "結束日期",
          type: "date",
        },
        {
          key: "dataQuality",
          label: "數據品質",
          type: "select",
          required: true,
          options: DATA_QUALITY_OPTIONS,
        },
        {
          key: "performanceEvaluation",
          label: "績效評估",
          type: "select",
          required: true,
          options: PERFORMANCE_EVALUATION_OPTIONS,
        },
      ].filter(Boolean) as Field[],
    [editingDetail]
  );

  useEffect(() => {
    const loadReports = async () => {
      if (!isSchemaInitialized) return;

      try {
        const response = await fetch(
          `/api/energy-review?company=${companyName}`
        );
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error("Failed to load reports:", error);
      }
    };

    loadReports();
  }, [companyName, isSchemaInitialized]);

  const columns = useMemo<MRT_ColumnDef<Detail>[]>(
    () => [
      {
        accessorKey: "name",
        header: "設備名稱",
        size: 140,
        Header: () => (
          <Tooltip title="設備名稱" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>設備名稱</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "type",
        header: "設備類型",
        size: 110,
        Header: () => (
          <Tooltip title="設備類型" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>設備類型</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "group",
        header: "群組",
        size: 110,
        Header: () => (
          <Tooltip title="群組" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>群組</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "area",
        header: "場域",
        size: 110,
        Header: () => (
          <Tooltip title="場域" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>場域</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "department",
        header: "部門",
        size: 110,
        Header: () => (
          <Tooltip title="部門" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>部門</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "workHours",
        header: "每日時數",
        size: 110,
        Header: () => (
          <Tooltip title="每日時數" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>每日時數</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "workDays",
        header: "工作天數",
        size: 110,
        Header: () => (
          <Tooltip title="工作天數" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>工作天數</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "loadFactor",
        header: "負載係數",
        size: 110,
        Header: () => (
          <Tooltip title="負載係數" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>負載係數</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "quantity",
        header: "數量",
        size: 110,
        Header: () => (
          <Tooltip title="數量" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>數量</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "totalHours",
        header: "總時數",
        size: 110,
        Header: () => (
          <Tooltip title="總時數" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>總時數</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "kwPerHour",
        header: "kW/Hour",
        size: 150,
        Header: () => (
          <Tooltip title="kW/Hour" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>kW/Hour</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(1) : "-";
        },
      },
      {
        accessorKey: "actualEnergy",
        header: "實際能耗",
        size: 130,
        Header: () => (
          <Tooltip title="實際能耗" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>實際能耗</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "actualConsumption",
        header: "能耗(度)",
        size: 110,
        Header: () => (
          <Tooltip title="能耗(度)" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>能耗(度)</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "startDate",
        header: "開始日期",
        size: 130,
        Header: () => (
          <Tooltip title="開始日期" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>開始日期</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "endDate",
        header: "結束日期",
        size: 130,
        Header: () => (
          <Tooltip title="結束日期" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>結束日期</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "dataQuality",
        header: "數據品質",
        size: 110,
        Header: () => (
          <Tooltip title="數據品質" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>數據品質</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "performanceEvaluation",
        header: "績效評估",
        size: 110,
        Header: () => (
          <Tooltip title="績效評估" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>績效評估</span>
            </div>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    setEditingDetail(undefined);
    setDetailCheckboxDialogOpen(true);
  };

  const handleEdit = (row: Detail) => {
    setEditingDetail(row);
    setDetailDialogOpen(true);
  };

  const handleDelete = (row: Detail) => {
    setDeleteDetailConfirm(row);
  };

  const transformRowToDetail = (row: ApiDetailResponse["rows"][0]): Detail => {
    let performanceEvaluation: Detail["performanceEvaluation"] = "不確定";
    if (row.PerfomanceLevel === 1) performanceEvaluation = "不合格";
    else if (row.PerfomanceLevel === 2) performanceEvaluation = "正在改善中";
    else if (row.PerfomanceLevel === 3) performanceEvaluation = "初評具潛力";

    return {
      id: row.ItemNo,
      name: row.EquipmentName,
      type: row.SourceType === "M" ? "生產設備" : "非生產設備",
      group: row.EnergyGroupName,
      area: row.EnergyAreaName,
      department: row.DepartName || "",
      workHours: row.DayHours || undefined,
      workDays: row.UsedDays || undefined,
      loadFactor: row.LoadFactor,
      quantity: row.Quantity,
      totalHours: row.UsedHours || 0,
      kwPerHour: row.KWHour,
      actualEnergy: row.RealConsumption || 0,
      actualConsumption: row.KW || undefined,
      startDate: row.StartDate || "",
      endDate: row.EndDate || "",
      dataQuality: row.DataQuality,
      performanceEvaluation,
      equipmentCode: row.MachineID || undefined,
      eceSgt: row.EceSgt,
    };
  };

  const handleDetailSubmit = async (
    data: Omit<Detail, "id"> & { equipmentId?: string }
  ) => {
    try {
      if (!selectedReport?.eeSgt) {
        console.error("No report selected");
        return;
      }

      const isEditing = Boolean(editingDetail?.id);
      console.log(`Starting ${isEditing ? "edit" : "add"} operation...`);
      console.log("Operation details:", {
        type: isEditing ? "edit" : "add",
        reportId: selectedReport.eeSgt,
        editingDetailId: editingDetail?.id,
        companyName,
      });
      console.log("Submitted form data:", data);

      // Map performance evaluation to number
      const performanceMap: Record<string, number> = {
        不合格: 1,
        正在改善中: 2,
        初評具潛力: 3,
        不確定: 4,
      };

      // Create form data for the POST request
      const formData = new URLSearchParams();
      formData.append("oper", isEditing ? "edit" : "add");
      formData.append("schema", companyName);
      formData.append("EeSgt", selectedReport.eeSgt.toString());
      formData.append("SourceType", data.type === "生產設備" ? "M" : "C");
      formData.append("MachineID", data.equipmentId || "");
      formData.append("EceSgt", data.eceSgt?.toString() || "0");
      formData.append("EquipmentName", data.name);
      formData.append("DayHours", (data.workHours || 0).toString());
      formData.append("UsedDays", (data.workDays || 0).toString());
      formData.append("LoadFactor", (data.loadFactor || 0).toString());
      formData.append("Quantity", (data.quantity || 0).toString());
      formData.append("UsedHours", (data.totalHours || 0).toString());
      formData.append("KWHour", (data.kwPerHour || 0).toString());
      formData.append("RealConsumption", (data.actualEnergy || 0).toString());
      formData.append("KW", (data.actualConsumption || 0).toString());
      formData.append("EnergyGroupName", data.group || "");
      formData.append("EnergyAreaName", data.area || "");
      formData.append("DepartName", data.department || "");
      formData.append("StartDate", data.startDate || "");
      formData.append("EndDate", data.endDate || "");
      formData.append("DataQuality", data.dataQuality?.toString() || "2");
      formData.append(
        "PerfomanceLevel",
        (performanceMap[data.performanceEvaluation] || 4).toString()
      );

      // For edit operations, include ItemNo and id
      if (isEditing && editingDetail?.id) {
        formData.append("ItemNo", editingDetail.id.toString());
        formData.append("id", editingDetail.id.toString());
        formData.append("RowNo", editingDetail.id.toString());
        console.log("Edit operation - including IDs:", {
          ItemNo: editingDetail.id,
          id: editingDetail.id,
          RowNo: editingDetail.id,
        });
      }

      console.log("Sending form data to API:", Object.fromEntries(formData));

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to ${isEditing ? "update" : "create"} detail: ${errorText}`
        );
      }

      console.log(`${isEditing ? "Edit" : "Add"} operation successful`);

      // Fetch updated details after successful operation
      console.log("Fetching updated details...");
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?schema=${companyName}&EeSgt=${selectedReport.eeSgt}&rows=10000&page=1&sidx=EeSgt&sord=asc`
      );

      const updatedData = await updatedResponse.json();
      console.log("Updated data received:", {
        status: updatedResponse.status,
        rowCount: updatedData.rows?.length || 0,
      });

      if (updatedResponse.ok && updatedData.rows) {
        const transformedDetails = updatedData.rows.map(transformRowToDetail);
        setDetails(transformedDetails);
        console.log(
          "Details state updated with",
          transformedDetails.length,
          "items"
        );
      }

      setDetailDialogOpen(false);
      setEditingDetail(undefined);
      console.log("Operation completed successfully");
    } catch (error) {
      console.error(
        `Failed to ${editingDetail ? "update" : "create"} detail:`,
        error
      );
    }
  };

  const handleDetailCheckboxSubmit = async (
    data: Omit<Detail, "id">,
    selectedEquipments: Equipment[]
  ): Promise<void> => {
    try {
      if (!selectedReport?.eeSgt) {
        throw new Error("No report selected");
      }

      const formParts = [
        `oper=batchadd`,
        `schema=${companyName}`,
        `EeSgt=${selectedReport.eeSgt}`,
        `SourceType=${data.type === "生產設備" ? "M" : "C"}`,
      ];

      // Equipment array data
      selectedEquipments.forEach((equipment) => {
        formParts.push(`EceSgt[]=${equipment.EceSgt}`);
        formParts.push(`MachineID[]=${equipment.code || ""}`);
        formParts.push(`EquipmentName[]=${encodeURIComponent(equipment.name)}`);
        formParts.push(
          `EnergyGroupName[]=${encodeURIComponent(
            equipment.usageGroupName || "未設定"
          )}`
        );
        formParts.push(
          `EnergyAreaName[]=${encodeURIComponent(
            equipment.workAreaName || "總廠"
          )}`
        );
        formParts.push(`KWHour[]=${(equipment.ratedPower || 0).toFixed(3)}`);
        formParts.push(`Quantity[]=1`);
        formParts.push(`DepartName[]=`);
      });

      // Important: Use actual values for hours and calculate KW
      const usedHours =
        data.totalHours !== undefined && data.totalHours !== null
          ? data.totalHours
          : 0;
      const kwPerHour = selectedEquipments[0]?.ratedPower || 0;
      const kw = usedHours * kwPerHour; // This is the actual consumption (能耗(度))

      // Common parameters with proper decimal formatting
      formParts.push(`DayHours=${data.workHours || 0}`);
      formParts.push(`WorkingDays=${data.workDays || 0}`);
      formParts.push(`UsedHours=${usedHours.toFixed(2)}`);
      formParts.push(`LoadFactor=${(data.loadFactor || 1).toFixed(2)}`);
      formParts.push(`KW=${kw.toFixed(2)}`); // KW represents 能耗(度)
      formParts.push(`RealConsumption=${kw.toFixed(2)}`); // Set RealConsumption to the same value as KW

      // Dates - add empty strings if not provided
      formParts.push(`StartDate=${data.startDate || ""}`);
      formParts.push(`EndDate=${data.endDate || ""}`);

      // Status parameters
      formParts.push(`DataQuality=${data.dataQuality || 2}`);
      formParts.push(`PerfomanceLevel=4`);

      const formBody = formParts.join("&");
      console.log("Sending batch form data to API:", formBody);

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formBody,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to batch add details: ${errorText}`);
      }

      // Fetch updated details after successful operation
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?schema=${companyName}&EeSgt=${selectedReport.eeSgt}&rows=10000&page=1&sidx=EeSgt&sord=asc`
      );

      const updatedData = await updatedResponse.json();
      if (updatedResponse.ok && updatedData.rows) {
        const transformedDetails = updatedData.rows.map(transformRowToDetail);
        setDetails(transformedDetails);
      }

      setDetailCheckboxDialogOpen(false);
    } catch (error) {
      console.error("Error in batch add operation:", error);
      throw error;
    }
  };

  const handleDeleteConfirmed = async (detail: Detail) => {
    try {
      if (!selectedReport?.eeSgt) {
        console.error("No report selected");
        return;
      }

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", companyName);
      formData.append("EeSgt", selectedReport.eeSgt.toString());
      formData.append("ItemNo", detail.id!.toString());
      formData.append("id", detail.id!.toString());
      formData.append("RowNo", detail.id!.toString());

      console.log("Delete form data:", Object.fromEntries(formData));

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete detail: ${errorText}`);
      }

      // Fetch updated details after successful deletion
      const updatedResponse = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyEstimateDetail.ashx?schema=${companyName}&EeSgt=${selectedReport.eeSgt}&rows=10000&page=1&sidx=EeSgt&sord=asc`
      );

      const updatedData = await updatedResponse.json();
      if (updatedResponse.ok && updatedData.rows) {
        const transformedDetails = updatedData.rows.map(transformRowToDetail);
        setDetails(transformedDetails);
      }

      setDeleteDetailConfirm(null);
    } catch (error) {
      console.error("Failed to delete detail:", error);
    }
  };

  const handleAddReport = () => {
    setEditingReport(undefined);
    setReportDialogOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setReportDialogOpen(true);
  };

  const handleDeleteReport = (report: Report) => {
    setDeleteReportConfirm(report);
  };

  const handleReportClick = async (report: Report) => {
    try {
      const response = await fetch(
        `/api/energy-review?company=${companyName}&eeSgt=${report.eeSgt}`
      );
      const data = await response.json();
      setDetails(data.details || []); // Add fallback empty array
      setSelectedReport(report);
      setShowReportList(false);
    } catch (error) {
      console.error("Failed to load report details:", error);
    }
  };

  const handleReportSubmit = async (data: Report) => {
    try {
      const response = await fetch(
        `/api/energy-review?company=${companyName}`,
        {
          method: editingReport ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            eeSgt: editingReport?.eeSgt,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save report");
      }

      setReports(result.reports);
      setReportDialogOpen(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  const handleDeleteReportConfirmed = async (report: Report) => {
    try {
      const response = await fetch(
        `/api/energy-review?company=${companyName}&eeSgt=${report.eeSgt}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete report");
      }

      setReports(result.reports);
      setDeleteReportConfirm(null);

      // If we're viewing this report's details, go back to the report list
      if (selectedReport?.eeSgt === report.eeSgt) {
        setShowReportList(true);
        setSelectedReport(null);
        setDetails([]);
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const renderReportContent = (report: Report) => (
    <>
      <h3 className="font-semibold text-lg text-gray-900">{report.title}</h3>
      <p className="text-gray-500 text-sm">
        {report.startDate} - {report.endDate}
      </p>
      <p className="text-gray-500 text-sm">審查人員: {report.reviewerId}</p>
    </>
  );

  return (
    <div className="p-2 space-y-2">
      {showReportList ? (
        <ListingPage
          title="報告列表"
          items={reports}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemClick={handleReportClick}
          onAddItem={handleAddReport}
          onEditItem={handleEditReport}
          onDeleteItem={handleDeleteReport}
          addButtonText="新增報告"
          renderItemContent={renderReportContent}
          noDelete
        />
      ) : (
        <DataGrid
          title={selectedReport?.title}
          data={details}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={() => setShowReportList(true)}
          initialState={{
            pagination: {
              pageSize: 50,
            },
          }}
        />
      )}

      <DetailDialog<Detail>
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onSubmit={handleDetailSubmit}
        initialData={editingDetail}
        mode="edit"
        title="項目"
        description="項目"
        fields={detailFields}
      />

      <DetailCheckboxDialog<Detail>
        open={detailCheckboxDialogOpen}
        onOpenChange={setDetailCheckboxDialogOpen}
        onSubmit={handleDetailCheckboxSubmit}
        mode="create"
        title="項目"
        description="項目"
        fields={detailFields}
      />

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleReportSubmit}
        initialData={editingReport}
        mode={editingReport ? "edit" : "create"}
      />

      {/* Detail Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDetailConfirm}
        onOpenChange={() => setDeleteDetailConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除項目</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除項目 &ldquo;{deleteDetailConfirm?.name}&rdquo; 嗎？
            <br />
            此操作無法復原。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDetailConfirm(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDetailConfirm &&
                handleDeleteConfirmed(deleteDetailConfirm)
              }
            >
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteReportConfirm}
        onOpenChange={() => setDeleteReportConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除報告</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除報告 &ldquo;{deleteReportConfirm?.title}&rdquo; 嗎？
            <br />
            此操作無法復原。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteReportConfirm(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteReportConfirm &&
                handleDeleteReportConfirmed(deleteReportConfirm)
              }
            >
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

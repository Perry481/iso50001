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

const detailFields: Field[] = [
  {
    key: "name",
    label: "名稱",
    type: "text",
    required: true,
  },
  {
    key: "type",
    label: "類型",
    type: "text",
  },
  {
    key: "group",
    label: "群組",
    type: "text",
  },
  {
    key: "area",
    label: "場域",
    type: "text",
  },
  {
    key: "department",
    label: "部門",
    type: "text",
  },
  {
    key: "workHours",
    label: "工作時數",
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
  {
    key: "kwPerHour",
    label: "每小時耗電量 (kW)",
    type: "number",
    required: true,
  },
  {
    key: "actualEnergy",
    label: "實際耗電量",
    type: "number",
  },
  {
    key: "actualConsumption",
    label: "實際能耗",
    type: "number",
  },
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

export default function EnergyECF() {
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

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("/api/energy-review");
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error("Failed to load reports:", error);
      }
    };

    loadReports();
  }, []);

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

  const handleDetailSubmit = async (data: Omit<Detail, "id">) => {
    try {
      if (!selectedReport?.title) {
        console.error("No report selected");
        return;
      }

      const response = await fetch("/api/energy-review", {
        method: editingDetail ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "detail",
          reportTitle: selectedReport.title,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save detail");
      }

      const refreshResponse = await fetch(
        `/api/energy-review?title=${encodeURIComponent(selectedReport.title)}`
      );
      const refreshData = await refreshResponse.json();
      setDetails(refreshData.details);

      setDetailDialogOpen(false);
      setEditingDetail(undefined);
    } catch (error) {
      console.error("Failed to save detail:", error);
    }
  };

  const handleDetailCheckboxSubmit = async (
    data: Omit<Detail, "id">,
    selectedEquipments: Equipment[]
  ) => {
    try {
      if (!selectedReport?.title) {
        console.error("No report selected");
        return;
      }

      // Create a form entry for each selected equipment
      const formEntries = selectedEquipments.map((equipment) => ({
        // Equipment identification
        equipmentId: equipment.id,
        // Device-specific data from the equipment
        name: equipment.name,
        type: equipment.equipmentType,
        group: equipment.usageGroup,
        area: equipment.workArea,
        department: "",
        kwPerHour: equipment.ratedPower || 0,
        quantity: equipment.quantity,

        // Common form data
        workHours: data.workHours,
        workDays: data.workDays,
        loadFactor: data.loadFactor,
        totalHours: data.totalHours,
        actualEnergy: data.actualEnergy,
        actualConsumption: (data.totalHours || 0) * (equipment.ratedPower || 0), // Recalculate for each device
        startDate: data.startDate,
        endDate: data.endDate,
        dataQuality: data.dataQuality,
        performanceEvaluation: data.performanceEvaluation,
      }));

      // Log the data being saved in a more concise structure
      console.log("Detail data that would be saved:", {
        report: {
          title: selectedReport.title,
          details: formEntries,
        },
      });

      // Close the dialog after logging
      setDetailCheckboxDialogOpen(false);
    } catch (error) {
      console.error("Error logging detail data:", error);
    }
  };

  const handleDeleteConfirmed = async (detail: Detail) => {
    try {
      if (!selectedReport?.title) {
        console.error("No report selected");
        return;
      }

      await fetch(`/api/energy-review`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "detail",
          reportTitle: selectedReport.title,
          detailId: detail.id,
        }),
      });

      const response = await fetch(
        `/api/energy-review?title=${encodeURIComponent(selectedReport.title)}`
      );
      const data = await response.json();
      setDetails(data.details);
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
        `/api/energy-review?title=${encodeURIComponent(report.title)}`
      );
      const data = await response.json();
      setDetails(data.details);
      setSelectedReport(report);
      setShowReportList(false);
    } catch (error) {
      console.error("Failed to load report details:", error);
    }
  };

  const handleReportSubmit = async (data: Report) => {
    try {
      const response = await fetch("/api/energy-review", {
        method: editingReport ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report",
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save report");
      }

      const refreshResponse = await fetch("/api/energy-review");
      const refreshData = await refreshResponse.json();
      setReports(refreshData.reports);

      setReportDialogOpen(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  const handleDeleteReportConfirmed = async (report: Report) => {
    try {
      await fetch(
        `/api/energy-review?title=${encodeURIComponent(report.title)}`,
        {
          method: "DELETE",
        }
      );

      const response = await fetch("/api/energy-review");
      const data = await response.json();
      setReports(data.reports);
      setDeleteReportConfirm(null);
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

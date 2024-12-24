"use client"; // We can remove this since we're using Pages Router

import { Button } from "../components/ui/button";
import { Pencil, Trash2, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Report, Detail } from "../lib/energy-review/types";
import { ReportDialog } from "../components/energy-review/ReportDialog";
import { DetailDialog } from "../components/energy-review/DetailDialog";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import PaginatedReports from "@/components/energy-review/PaginatedReports";
import Tooltip from "@mui/material/Tooltip";

// Add the ReportFormData type
type ReportFormData = {
  title: string;
  reviewerId: string;
  startDate: string;
  endDate: string;
};

// Add this before the columns definition
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
  const [activeReport, setActiveReport] = useState<string>("");
  const [details, setDetails] = useState<Detail[]>([]);
  const [showReportList, setShowReportList] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | undefined>();
  const [editingDetail, setEditingDetail] = useState<Detail | undefined>();
  const BASE_COLUMN_WIDTH = 110; // New base (previous 120% becomes 100%)
  const MIN_COLUMN_WIDTH = 55; // Adjusted minimum (50 * 1.2)
  const MAX_COLUMN_WIDTH = 275; // Adjusted maximum (250 * 1.2)
  const ZOOM_STEP = 11; // Adjusted zoom step (10 * 1.2)
  const [columnWidth, setColumnWidth] = useState(BASE_COLUMN_WIDTH);
  const [deleteReportConfirm, setDeleteReportConfirm] = useState<Report | null>(
    null
  );
  const [deleteDetailConfirm, setDeleteDetailConfirm] = useState<Detail | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const handleCompressView = () => {
    setColumnWidth((prev) => Math.max(MIN_COLUMN_WIDTH, prev - ZOOM_STEP));
  };

  const handleExpandView = () => {
    setColumnWidth((prev) => Math.min(MAX_COLUMN_WIDTH, prev + ZOOM_STEP));
  };

  const columns = useMemo<MRT_ColumnDef<Detail>[]>(
    () => [
      {
        accessorKey: "name",
        header: "設備名稱",
        size: columnWidth + 30,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth,
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
        size: columnWidth + 40,
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
        size: columnWidth + 20,
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
        size: columnWidth,
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
        size: columnWidth + 20,
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
        size: columnWidth + 20,
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
        size: columnWidth,
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
        size: columnWidth,
        Header: () => (
          <Tooltip title="績效評估" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>績效評估</span>
            </div>
          </Tooltip>
        ),
      },
    ],
    [columnWidth]
  );

  const handleDetailSubmit = async (data: Omit<Detail, "id">) => {
    try {
      const response = await fetch("/api/energy-review", {
        method: editingDetail ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "detail",
          reportTitle: activeReport,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save detail");
      }

      // Refresh details list
      const refreshResponse = await fetch(
        `/api/energy-review?title=${encodeURIComponent(activeReport)}`
      );
      const refreshData = await refreshResponse.json();
      setDetails(refreshData.details);

      setDetailDialogOpen(false);
      setEditingDetail(undefined);
    } catch (error) {
      console.error("Failed to save detail:", error);
    }
  };
  // Create theme
  const theme = createTheme({
    palette: {
      background: {
        default: "#ffffff",
      },
    },
    components: {
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              backgroundColor: "#f9fafb",
            },
          },
        },
      },
    },
  });
  const loadReports = async () => {
    try {
      const response = await fetch("/api/energy-review");
      const data = await response.json();
      setReports(data.reports);
      if (data.reports.length > 0) {
        setActiveReport(data.reports[0].title);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  };

  const loadDetails = useMemo(
    () => async () => {
      if (!activeReport) return;
      try {
        const response = await fetch(
          `/api/energy-review?title=${encodeURIComponent(activeReport)}`
        );
        const data = await response.json();
        setDetails(data.details);
      } catch (error) {
        console.error("Failed to load report details:", error);
      }
    },
    [activeReport]
  );
  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);
  // energy-review.tsx
  const handleReportSubmit = async (data: ReportFormData) => {
    try {
      if (editingReport) {
        await fetch("/api/energy-review", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "report",
            data: data,
          }),
        });
      } else {
        await fetch("/api/energy-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "report",
            data: data,
          }),
        });
      }

      const response = await fetch("/api/energy-review");
      const updatedData = await response.json();
      setReports(updatedData.reports);
      setReportDialogOpen(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  const handleDeleteReport = async (report: Report) => {
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

  const handleDeleteDetail = async (detail: Detail) => {
    try {
      await fetch(`/api/energy-review`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "detail",
          reportTitle: activeReport,
          detailId: detail.id,
        }),
      });

      // Refresh details list
      const response = await fetch(
        `/api/energy-review?title=${encodeURIComponent(activeReport)}`
      );
      const data = await response.json();
      setDetails(data.details);
      setDeleteDetailConfirm(null);
    } catch (error) {
      console.error("Failed to delete detail:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      {showReportList ? (
        <PaginatedReports
          reports={reports}
          onReportClick={(report) => {
            setActiveReport(report.title);
            setShowReportList(false);
          }}
          onEditReport={(report) => {
            setEditingReport(report);
            setReportDialogOpen(true);
          }}
          onDeleteReport={(report) => {
            setDeleteReportConfirm(report);
          }}
          onAddReport={() => {
            setEditingReport(undefined);
            setReportDialogOpen(true);
          }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{activeReport}</h1>
              <Button
                variant="outline"
                onClick={() => setShowReportList(true)}
                className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
              >
                返回列表
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCompressView} // Changed from handleExpandView
                disabled={columnWidth <= MIN_COLUMN_WIDTH}
                className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500 min-w-[4rem] text-center">
                {Math.round((columnWidth / BASE_COLUMN_WIDTH) * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleExpandView} // Changed from handleCompressView
                disabled={columnWidth >= MAX_COLUMN_WIDTH}
                className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  setEditingDetail(undefined);
                  setDetailDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> 新增項目
              </Button>
            </div>
          </div>

          <div>
            <ThemeProvider theme={theme}>
              <MaterialReactTable
                columns={columns}
                data={details}
                enableColumnActions={false}
                enableColumnFilters={false}
                enableTopToolbar={false}
                enableStickyHeader
                enablePagination
                enableColumnResizing
                muiTableContainerProps={{
                  sx: {
                    maxHeight: "calc(75vh - 20px)",
                  },
                }}
                muiPaginationProps={{
                  rowsPerPageOptions: [5, 10, 20, 50],
                  showFirstButton: true,
                  showLastButton: true,
                  sx: {
                    marginTop: "4px",
                  },
                }}
                localization={{
                  rowsPerPage: "每頁行數",
                  of: "/",
                  noResultsFound: "沒有找到結果",
                  noRecordsToDisplay: "沒有記錄可顯示",
                }}
                initialState={{
                  pagination: {
                    pageSize: 10,
                    pageIndex: 0,
                  },
                  density: "compact",
                }}
                muiTablePaperProps={{
                  sx: {
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    width: "100%",
                    overflow: "hidden",
                  },
                }}
                defaultColumn={{
                  minSize: 50,
                  maxSize: 1000,
                  size: columnWidth,
                  muiTableHeadCellProps: {
                    sx: {
                      whiteSpace: "normal",
                      height: "40px",
                      padding: "0 12px",
                      backgroundColor: "#f8fafc",
                      fontWeight: "600",
                      fontSize: "0.875rem",
                      color: "#475569",
                      borderRight: "1px solid #e2e8f0",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex !important",
                      alignItems: "center !important",
                      justifyContent: "center",
                      "&:last-child": {
                        borderRight: "1px solid #e2e8f0",
                      },
                      "& .Mui-TableHeadCell-Content": {
                        width: "100%",
                        display: "flex",
                        alignItems: "center !important",
                        justifyContent: "center",
                        padding: "0",
                        textAlign: "center",
                        margin: "0",
                      },
                      "& .Mui-TableHeadCell-ResizeHandle": {
                        width: "1px",
                        right: "0",
                        height: "100%",
                        position: "absolute",
                        cursor: "col-resize",
                        touchAction: "none",
                        opacity: 0,
                        "&:hover, &.isResizing": {
                          opacity: 1,
                          backgroundColor: "#94a3b8",
                          width: "3px",
                          right: "-1.5px",
                        },
                      },
                    },
                  },
                  muiTableBodyCellProps: {
                    sx: {
                      padding: "4px 12px",
                      borderRight: "1px solid #e2e8f0",
                      "&:last-child": {
                        borderRight: "1px solid #e2e8f0",
                      },
                    },
                  },
                }}
                columnResizeMode="onChange"
                enableRowActions
                displayColumnDefOptions={{
                  "mrt-row-actions": {
                    header: "操作",
                    size: 100,
                    muiTableHeadCellProps: {
                      align: "center",
                      sx: {
                        borderRight: "1px solid #e2e8f0",
                      },
                    },
                    muiTableBodyCellProps: {
                      align: "center",
                      sx: {
                        borderRight: "1px solid #e2e8f0",
                      },
                    },
                  },
                }}
                renderRowActions={({ row }) => (
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingDetail(row.original);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteDetailConfirm(row.original);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              />
            </ThemeProvider>
          </div>
        </>
      )}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleReportSubmit}
        initialData={editingReport}
        mode={editingReport ? "edit" : "create"}
      />

      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onSubmit={handleDetailSubmit}
        initialData={editingDetail}
        mode={editingDetail ? "edit" : "create"}
      />

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
                deleteReportConfirm && handleDeleteReport(deleteReportConfirm)
              }
            >
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                deleteDetailConfirm && handleDeleteDetail(deleteDetailConfirm)
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

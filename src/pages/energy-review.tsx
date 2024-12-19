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

export default function EnergyECF() {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<string>("");
  const [details, setDetails] = useState<Detail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showReportList, setShowReportList] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | undefined>();
  const [editingDetail, setEditingDetail] = useState<Detail | undefined>();
  const BASE_COLUMN_WIDTH = 100; // Reduced from 120 to get closer to 83% default view
  const MIN_COLUMN_WIDTH = 50; // Reduced minimum to allow more zoom in
  const MAX_COLUMN_WIDTH = 250; // Increased maximum to allow more zoom out
  const ZOOM_STEP = 10; // Smaller step size for finer control
  const [columnWidth, setColumnWidth] = useState(BASE_COLUMN_WIDTH);
  const [deleteReportConfirm, setDeleteReportConfirm] = useState<Report | null>(
    null
  );
  const [deleteDetailConfirm, setDeleteDetailConfirm] = useState<Detail | null>(
    null
  );

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
        header: "名稱",
        size: columnWidth + 30,
      },
      {
        accessorKey: "type",
        header: "類型",
        size: columnWidth,
      },
      {
        accessorKey: "group",
        header: "群組",
        size: columnWidth,
      },
      {
        accessorKey: "area",
        header: "區域",
        size: columnWidth,
      },
      {
        accessorKey: "department",
        header: "部門",
        size: columnWidth,
      },
      {
        accessorKey: "workHours",
        header: "工作時數",
        size: columnWidth,
        Cell: ({ cell }) => cell.getValue<number>().toFixed(0),
      },
      {
        accessorKey: "workDays",
        header: "工作天數",
        size: columnWidth,
        Cell: ({ cell }) => cell.getValue<number>().toFixed(0),
      },
      {
        accessorKey: "dailyHours",
        header: "每日時數",
        size: columnWidth,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "workingDays",
        header: "工作天數",
        size: columnWidth,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(0) : "-";
        },
      },
      {
        accessorKey: "totalHours",
        header: "總時數",
        size: columnWidth,
        Cell: ({ cell }) => cell.getValue<number>().toFixed(2),
      },
      {
        accessorKey: "kwPerHour",
        header: "每小時耗電量 (kW)",
        size: columnWidth + 40,
        Cell: ({ cell }) => cell.getValue<number>().toFixed(1),
      },
      {
        accessorKey: "actualEnergy",
        header: "實際耗電量",
        size: columnWidth + 20,
        Cell: ({ cell }) => cell.getValue<number>().toFixed(2),
      },
      {
        accessorKey: "actualConsumption",
        header: "實際能耗",
        size: columnWidth,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "startDate",
        header: "開始日期",
        size: columnWidth + 20,
      },
      {
        accessorKey: "endDate",
        header: "結束日期",
        size: columnWidth + 20,
      },
      {
        accessorKey: "dataQuality",
        header: "數據品質",
        size: columnWidth,
      },
      {
        accessorKey: "performanceEvaluation",
        header: "績效評估",
        size: columnWidth,
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

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!activeReport) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/energy-review?title=${encodeURIComponent(activeReport)}`
        );
        const data = await response.json();
        setDetails(data.details);
      } catch (error) {
        console.error("Failed to load report details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [activeReport]);

  const handleReportSubmit = async (data: Omit<Report, "reviewerId">) => {
    try {
      if (editingReport) {
        await fetch("/api/energy-review", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "report", data: { ...data } }),
        });
      } else {
        await fetch("/api/energy-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "report",
            data: { ...data, reviewerId: "system" },
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
    <div className="p-6 space-y-6">
      {showReportList ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl">報告列表</h2>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                setEditingReport(undefined);
                setReportDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> 新增報告
            </Button>
          </div>
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.title}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:outline hover:outline-1 hover:outline-blue-500 cursor-pointer "
                onClick={() => {
                  setActiveReport(report.title);
                  setShowReportList(false);
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {report.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {report.startDate} - {report.endDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingReport(report);
                        setReportDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteReportConfirm(report);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
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

          <div style={{ fontSize: `${zoomLevel}%` }}>
            <ThemeProvider theme={theme}>
              <MaterialReactTable
                columns={columns}
                data={details}
                enableColumnActions={false}
                enableColumnFilters={false}
                enablePagination={false}
                enableTopToolbar={false}
                enableBottomToolbar={false}
                enableRowSelection={false}
                enableColumnResizing={false}
                enableStickyHeader
                muiTableContainerProps={{
                  sx: {
                    maxHeight: "70vh",
                    overflow: "auto",
                    width: "100%",
                  },
                }}
                muiTablePaperProps={{
                  sx: {
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  },
                }}
                defaultColumn={{
                  muiTableHeadCellProps: {
                    sx: {
                      whiteSpace: "normal",
                      height: "auto",
                      padding: "8px",
                      backgroundColor: "#f9fafb",
                      fontWeight: "600",
                      fontSize: "0.875rem",
                      borderRight: "1px solid #e5e7eb",
                      "&:last-child": {
                        borderRight: "none",
                      },
                      "& .MuiTableSortLabel-root": {
                        width: "100%",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        justifyContent: "space-between",
                      },
                      "& .MuiTableSortLabel-icon": {
                        margin: 0,
                      },
                    },
                  },
                  muiTableBodyCellProps: {
                    sx: {
                      padding: "8px",
                      borderRight: "1px solid #e5e7eb",
                      "&:last-child": {
                        borderRight: "none",
                      },
                    },
                  },
                }}
                displayColumnDefOptions={{
                  "mrt-row-actions": {
                    header: "操作",
                    size: 100,
                  },
                }}
                enableRowActions
                renderRowActions={({ row }) => (
                  <div className="flex gap-1">
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

import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "../components/DataGrid";
import { ListingPage } from "../components/ListingPage";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Detail } from "../components/dialogs/DetailDialog";
import { ReportDialog, type Report } from "../components/dialogs/ReportDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

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

export default function GridTest() {
  const [details, setDetails] = useState<Detail[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<Detail | undefined>();
  const [deleteDetailConfirm, setDeleteDetailConfirm] = useState<Detail | null>(
    null
  );

  const [reports, setReports] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | undefined>();
  const [deleteReportConfirm, setDeleteReportConfirm] = useState<Report | null>(
    null
  );
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reportsResponse = await fetch("/api/energy-review");
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports);

        if (reportsData.reports.length > 0) {
          const firstReport = reportsData.reports[0];
          const detailsResponse = await fetch(
            `/api/energy-review?title=${encodeURIComponent(firstReport.title)}`
          );
          const detailsData = await detailsResponse.json();
          setDetails(detailsData.details);
        }
      } catch (error) {
        console.error("Failed to load test data:", error);
      }
    };

    loadData();
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
    ],
    []
  );

  const handleAdd = () => {
    setEditingDetail(undefined);
    setDetailDialogOpen(true);
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
      const response = await fetch("/api/energy-review", {
        method: editingDetail ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "detail",
          reportTitle: selectedReport?.title || "Test Report",
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save detail");
      }

      const refreshResponse = await fetch(
        `/api/energy-review?title=${encodeURIComponent(
          selectedReport?.title || "Test Report"
        )}`
      );
      const refreshData = await refreshResponse.json();
      setDetails(refreshData.details);

      setDetailDialogOpen(false);
      setEditingDetail(undefined);
    } catch (error) {
      console.error("Failed to save detail:", error);
    }
  };

  const handleDeleteConfirmed = async (detail: Detail) => {
    try {
      await fetch(`/api/energy-review`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "detail",
          reportTitle: selectedReport?.title || "Test Report",
          detailId: detail.id,
        }),
      });

      const response = await fetch(
        `/api/energy-review?title=${encodeURIComponent(
          selectedReport?.title || "Test Report"
        )}`
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
      {selectedReport ? (
        <DataGrid
          title={selectedReport.title}
          data={details}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={() => setSelectedReport(null)}
        />
      ) : (
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
      )}

      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onSubmit={handleDetailSubmit}
        initialData={editingDetail}
        mode={editingDetail ? "edit" : "create"}
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

"use client";

import { useState, useEffect } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "../components/DataGrid";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Field } from "../components/dialogs/DetailDialog";
import type { ECF } from "@/lib/energy-ecf/types";
import { energyECFService } from "@/lib/energy-ecf/service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export interface EnergyUsage {
  id?: string | number;
  name: string;
  categoryCode: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  usage: number;
  unit: string;
  meterNumber: string;
  note?: string;
}

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

export default function OrgEnergyUsage() {
  const [records, setRecords] = useState<EnergyUsage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnergyUsage | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<EnergyUsage | null>(null);
  const [ecfs, setEcfs] = useState<ECF[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load ECFs
        const ecfData = await energyECFService.getECFs();
        setEcfs(ecfData);

        // Load records
        const recordsResponse = await fetch("/api/org-energy-usage");
        const recordsData = await recordsResponse.json();
        setRecords(recordsData.records);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const fields: Field[] = [
    {
      key: "name",
      label: "使用名稱",
      type: "text",
      required: true,
    },
    {
      key: "categoryCode",
      label: "類別代碼",
      type: "text",
      required: true,
      disabled: true,
    },
    {
      key: "categoryName",
      label: "類別名稱",
      type: "select",
      required: true,
      options: ecfs.map((ecf) => ({
        value: ecf.name,
        label: ecf.name,
      })),
      onChange: (value: string) => {
        const selectedEcf = ecfs.find((ecf) => ecf.name === value);
        if (selectedEcf) {
          setEditingRecord((prev) =>
            prev
              ? {
                  ...prev,
                  categoryName: selectedEcf.name,
                  categoryCode: selectedEcf.code,
                  unit: selectedEcf.unit,
                }
              : undefined
          );
        }
      },
    },
    {
      key: "startDate",
      label: "啟始日期",
      type: "date",
      required: true,
    },
    {
      key: "endDate",
      label: "結束日期",
      type: "date",
      required: true,
    },
    {
      key: "usage",
      label: "使用量",
      type: "number",
      required: true,
    },
    {
      key: "unit",
      label: "單位",
      type: "text",
      required: true,
      disabled: true,
    },
    {
      key: "meterNumber",
      label: "量表編號",
      type: "text",
      required: true,
    },
    {
      key: "note",
      label: "備註",
      type: "text",
    },
  ];

  const columns: MRT_ColumnDef<EnergyUsage>[] = [
    {
      accessorKey: "name",
      header: "使用名稱",
      size: 200,
      Header: () => (
        <Tooltip title="使用名稱" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>使用名稱</span>
          </div>
        </Tooltip>
      ),
    },
    {
      accessorKey: "categoryCode",
      header: "類別代碼",
      size: 110,
      Header: () => (
        <Tooltip title="類別代碼" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>類別代碼</span>
          </div>
        </Tooltip>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "類別名稱",
      size: 110,
      Header: () => (
        <Tooltip title="類別名稱" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>類別名稱</span>
          </div>
        </Tooltip>
      ),
    },
    {
      accessorKey: "startDate",
      header: "啟始日期",
      size: 130,
      Header: () => (
        <Tooltip title="啟始日期" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>啟始日期</span>
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
      accessorKey: "usage",
      header: "使用量",
      size: 110,
      Header: () => (
        <Tooltip title="使用量" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>使用量</span>
          </div>
        </Tooltip>
      ),
      Cell: ({ cell }) => {
        const value = cell.getValue<number>();
        return value ? value.toFixed(2) : "-";
      },
    },
    {
      accessorKey: "unit",
      header: "單位",
      size: 80,
      Header: () => (
        <Tooltip title="單位" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>單位</span>
          </div>
        </Tooltip>
      ),
    },
    {
      accessorKey: "meterNumber",
      header: "量表編號",
      size: 130,
      Header: () => (
        <Tooltip title="量表編號" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>量表編號</span>
          </div>
        </Tooltip>
      ),
    },
    {
      accessorKey: "note",
      header: "備註",
      size: 200,
      Header: () => (
        <Tooltip title="備註" {...tooltipProps}>
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>備註</span>
          </div>
        </Tooltip>
      ),
    },
  ];

  const handleAdd = () => {
    // Find default ECF (e.g., first in the list)
    const defaultEcf = ecfs[0];
    const today = new Date().toISOString().split("T")[0];

    // For new records, we set initial values but don't set an ID
    const initialData = {
      name: "",
      categoryCode: defaultEcf?.code || "",
      categoryName: defaultEcf?.name || "",
      startDate: today,
      endDate: today,
      usage: 0,
      unit: defaultEcf?.unit || "",
      meterNumber: "",
      note: "",
    };

    setEditingRecord(initialData);
    setDialogOpen(true);
  };

  const handleEdit = (row: EnergyUsage) => {
    setEditingRecord(row);
    setDialogOpen(true);
  };

  const handleDelete = (row: EnergyUsage) => {
    setDeleteConfirm(row);
  };

  const handleSubmit = async (data: Omit<EnergyUsage, "id">) => {
    // Find the matching ECF to get all ECF data
    const selectedEcf = ecfs.find((ecf) => ecf.code === data.categoryCode);
    const submissionData = {
      ...data,
      categoryName: selectedEcf?.name || "",
      unit: selectedEcf?.unit || "",
    };

    try {
      // TODO: Implement actual API call for create/update
      // For now, mock the API response with local state updates
      if (editingRecord && "id" in editingRecord) {
        // Update existing record
        const updatedRecord = {
          ...submissionData,
          id: editingRecord.id,
        };
        setRecords((prev) =>
          prev.map((record) =>
            record.id === editingRecord.id ? updatedRecord : record
          )
        );
      } else {
        // Create new record with a temporary ID
        const newRecord = {
          ...submissionData,
          id: `temp_${Date.now()}`,
        };
        setRecords((prev) => [...prev, newRecord]);
      }

      setDialogOpen(false);
      setEditingRecord(undefined);
    } catch (error) {
      console.error("Failed to save record:", error);
    }
  };

  const handleDeleteConfirmed = async (record: EnergyUsage) => {
    try {
      // TODO: Implement actual API call for deletion
      // For now, just update the UI state
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <DataGrid
        title="能耗記錄一覽"
        data={records}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DetailDialog<EnergyUsage>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingRecord}
        mode={editingRecord ? "edit" : "create"}
        title="能耗記錄"
        description="能耗記錄"
        fields={fields}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除記錄</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除記錄 &ldquo;{deleteConfirm?.name}&rdquo; 嗎？
            <br />
            此操作無法復原。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm && handleDeleteConfirmed(deleteConfirm)
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

"use client";

import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "../components/DataGrid";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Field } from "../components/dialogs/DetailDialog";
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

const UNIT_OPTIONS = [
  { value: "公升", label: "公升" },
  { value: "度", label: "度" },
];

const CATEGORY_NAME_OPTIONS = [
  { value: "燃料油", label: "燃料油" },
  { value: "天然氣(NG)自產", label: "天然氣(NG)自產" },
  { value: "液化石油氣(LPG)", label: "液化石油氣(LPG)" },
  { value: "車用汽油", label: "車用汽油" },
  { value: "柴油", label: "柴油" },
  { value: "台電電力", label: "台電電力" },
];

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
  },
  {
    key: "categoryName",
    label: "類別名稱",
    type: "select",
    required: true,
    options: CATEGORY_NAME_OPTIONS,
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
    type: "select",
    required: true,
    options: UNIT_OPTIONS,
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

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch("/api/org-energy-usage");
        const data = await response.json();
        setRecords(data.records);
      } catch (error) {
        console.error("Failed to load records:", error);
      }
    };

    loadRecords();
  }, []);

  const columns = useMemo<MRT_ColumnDef<EnergyUsage>[]>(
    () => [
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
        header: "備��",
        size: 200,
        Header: () => (
          <Tooltip title="備註" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>備註</span>
            </div>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    setEditingRecord({
      categoryCode: "401",
      categoryName: "台電電力",
    } as EnergyUsage);
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
    try {
      const response = await fetch("/api/org-energy-usage", {
        method: editingRecord ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: editingRecord?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save record");
      }

      const result = await response.json();

      if (editingRecord) {
        setRecords((prev) =>
          prev.map((record) =>
            record.id === editingRecord.id ? result.record : record
          )
        );
      } else {
        setRecords((prev) => [...prev, result.record]);
      }

      setDialogOpen(false);
      setEditingRecord(undefined);
    } catch (error) {
      console.error("Failed to save record:", error);
    }
  };

  const handleDeleteConfirmed = async (record: EnergyUsage) => {
    try {
      const response = await fetch(`/api/org-energy-usage/${record.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

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

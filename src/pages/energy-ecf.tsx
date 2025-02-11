// pages/energy-ecf.tsx
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

export interface ECF {
  id?: string | number;
  code: string;
  name: string;
  unit: string;
  factor: number;
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

const fields: Field[] = [
  {
    key: "code",
    label: "ECF編號",
    type: "text",
    required: true,
  },
  {
    key: "name",
    label: "ECF名稱",
    type: "text",
    required: true,
  },
  {
    key: "unit",
    label: "能耗單位",
    type: "text",
    required: true,
  },
  {
    key: "factor",
    label: "ECF係數",
    type: "number",
    required: true,
  },
  {
    key: "note",
    label: "備註",
    type: "text",
  },
];

export default function EnergyECF() {
  const [ecfs, setEcfs] = useState<ECF[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEcf, setEditingEcf] = useState<ECF | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<ECF | null>(null);

  useEffect(() => {
    const loadECFs = async () => {
      try {
        const response = await fetch("/api/energy-ecf");
        const data = await response.json();
        setEcfs(data.ecfs);
      } catch (error) {
        console.error("Failed to load ECFs:", error);
      }
    };

    loadECFs();
  }, []);

  const columns = useMemo<MRT_ColumnDef<ECF>[]>(
    () => [
      {
        accessorKey: "code",
        header: "ECF編號",
        size: 110,
        Header: () => (
          <Tooltip title="ECF編號" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>ECF編號</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "name",
        header: "ECF名稱",
        size: 140,
        Header: () => (
          <Tooltip title="ECF名稱" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>ECF名稱</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "unit",
        header: "能耗單位",
        size: 110,
        Header: () => (
          <Tooltip title="能耗單位" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>能耗單位</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "factor",
        header: "ECF係數",
        size: 110,
        Header: () => (
          <Tooltip title="ECF係數" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>ECF係數</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "note",
        header: "備註",
        size: 150,
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
    setEditingEcf(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (row: ECF) => {
    setEditingEcf(row);
    setDialogOpen(true);
  };

  const handleDelete = (row: ECF) => {
    setDeleteConfirm(row);
  };

  const handleDeleteConfirmed = async (ecf: ECF) => {
    try {
      // TODO: Implement actual API call for deletion
      // For now, just update the UI state
      setEcfs((prev) => prev.filter((e) => e.id !== ecf.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete ECF:", error);
    }
  };

  const handleSubmit = async (data: Omit<ECF, "id">) => {
    try {
      // TODO: Implement actual API call for create/update
      // For now, mock the API response with local state updates
      if (editingEcf) {
        // Update existing ECF
        const updatedEcf = {
          ...data,
          id: editingEcf.id,
        };
        setEcfs((prev) =>
          prev.map((ecf) => (ecf.id === editingEcf.id ? updatedEcf : ecf))
        );
      } else {
        // Create new ECF with a temporary ID
        const newEcf = {
          ...data,
          id: `temp_${Date.now()}`, // Using a string ID with prefix to match the API format
        };
        setEcfs((prev) => [...prev, newEcf]);
      }

      setDialogOpen(false);
      setEditingEcf(undefined);
    } catch (error) {
      console.error("Error saving ECF:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <DataGrid
        title="能源ECF"
        data={ecfs}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DetailDialog<ECF>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingEcf}
        mode={editingEcf ? "edit" : "create"}
        title="ECF"
        description="ECF"
        fields={fields}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除ECF</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除ECF &ldquo;{deleteConfirm?.name}&rdquo; 嗎？
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

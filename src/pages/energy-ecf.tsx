// pages/energy-ecf.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "../components/DataGrid";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Field } from "../components/dialogs/DetailDialog";

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

  const handleDelete = async (row: ECF) => {
    if (!confirm("確定要刪除此ECF嗎？")) return;

    try {
      const response = await fetch(`/api/energy-ecf/${row.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete ECF");

      setEcfs((prev) => prev.filter((ecf) => ecf.id !== row.id));
    } catch (error) {
      console.error("Error deleting ECF:", error);
    }
  };

  const handleSubmit = async (data: Omit<ECF, "id">) => {
    try {
      const response = await fetch("/api/energy-ecf", {
        method: editingEcf ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: editingEcf?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to save ECF");

      const result = await response.json();

      if (editingEcf) {
        setEcfs((prev) =>
          prev.map((ecf) => (ecf.id === editingEcf.id ? result.ecf : ecf))
        );
      } else {
        setEcfs((prev) => [...prev, result.ecf]);
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
    </div>
  );
}

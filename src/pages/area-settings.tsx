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

export interface Area {
  id?: string | number;
  code: string;
  name: string;
  department: string;
  meterNumber?: string;
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

export default function AreaSettings() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Area | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load areas
        const areasResponse = await fetch("/api/area-settings");
        const areasData = await areasResponse.json();
        setAreas(areasData.areas);

        // Load department options
        const deptResponse = await fetch("/api/area-settings?type=departments");
        const deptData = await deptResponse.json();
        setDepartmentOptions(deptData.departments);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const fields: Field[] = [
    {
      key: "code",
      label: "場域編號",
      type: "text",
      required: true,
    },
    {
      key: "name",
      label: "場域名稱",
      type: "text",
      required: true,
    },
    {
      key: "department",
      label: "部門",
      type: "select",
      required: true,
      options: departmentOptions,
      selectContentProps: {
        className: "max-h-[300px] overflow-y-auto",
      },
    },
    {
      key: "meterNumber",
      label: "量表編號",
      type: "text",
    },
    {
      key: "note",
      label: "備註",
      type: "text",
    },
  ];

  const columns = useMemo<MRT_ColumnDef<Area>[]>(
    () => [
      {
        accessorKey: "code",
        header: "場域編號",
        size: 110,
        Header: () => (
          <Tooltip title="場域編號" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>場域編號</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "name",
        header: "場域名稱",
        size: 140,
        Header: () => (
          <Tooltip title="場域名稱" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>場域名稱</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "department",
        header: "部門",
        size: 140,
        Header: () => (
          <Tooltip title="部門" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>部門</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const option = departmentOptions.find((opt) => opt.value === value);
          return option ? option.label : value;
        },
      },
      {
        accessorKey: "meterNumber",
        header: "量表編號",
        size: 110,
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
    ],
    [departmentOptions]
  );

  const handleAdd = () => {
    setEditingArea({
      department: "(未設定)",
    } as Area);
    setDialogOpen(true);
  };

  const handleEdit = (row: Area) => {
    setEditingArea(row);
    setDialogOpen(true);
  };

  const handleDelete = (row: Area) => {
    setDeleteConfirm(row);
  };

  const handleSubmit = async (data: Omit<Area, "id">) => {
    try {
      const response = await fetch("/api/area-settings", {
        method: editingArea ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: editingArea?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save area");
      }

      const result = await response.json();

      if (editingArea) {
        setAreas((prev) =>
          prev.map((area) => (area.id === editingArea.id ? result.area : area))
        );
      } else {
        setAreas((prev) => [...prev, result.area]);
      }

      setDialogOpen(false);
      setEditingArea(undefined);
    } catch (error) {
      console.error("Failed to save area:", error);
    }
  };

  const handleDeleteConfirmed = async (area: Area) => {
    try {
      const response = await fetch(`/api/area-settings/${area.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete area");
      }

      setAreas((prev) => prev.filter((a) => a.id !== area.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete area:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <DataGrid
        title="工作場域管理"
        data={areas}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DetailDialog<Area>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingArea}
        mode={editingArea ? "edit" : "create"}
        title="工作場域"
        description="工作場域"
        fields={fields}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除場域</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除場域 &ldquo;{deleteConfirm?.name}&rdquo; ���？
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

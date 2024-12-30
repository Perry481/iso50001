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
import type { Equipment } from "./api/energy-equipment";
import {
  EQUIPMENT_TYPE_OPTIONS,
  WORK_AREA_OPTIONS,
  STATUS_OPTIONS,
  USAGE_GROUP_OPTIONS,
  MANUFACTURER_OPTIONS,
} from "./api/energy-equipment";
import { DEPARTMENT_OPTIONS } from "./api/area-settings";

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

export default function EnergyEquipment() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<
    Equipment | undefined
  >();
  const [deleteConfirm, setDeleteConfirm] = useState<Equipment | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/energy-equipment");
        const data = await response.json();
        setEquipments(data.equipments);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const fields: Field[] = [
    {
      key: "code",
      label: "設備編號",
      type: "text",
      required: true,
    },
    {
      key: "name",
      label: "設備名稱",
      type: "text",
      required: true,
    },
    {
      key: "referenceCode",
      label: "參考設備",
      type: "text",
    },
    {
      key: "manufacturer",
      label: "類別代碼",
      type: "select",
      required: true,
      options: MANUFACTURER_OPTIONS,
    },
    {
      key: "equipmentType",
      label: "設備類型",
      type: "select",
      required: true,
      options: EQUIPMENT_TYPE_OPTIONS,
    },
    {
      key: "workArea",
      label: "工作場域",
      type: "select",
      required: true,
      options: WORK_AREA_OPTIONS,
    },
    {
      key: "department",
      label: "部門",
      type: "select",
      required: true,
      options: DEPARTMENT_OPTIONS,
      selectContentProps: {
        className: "max-h-[300px] overflow-y-auto",
      },
    },
    {
      key: "usageGroup",
      label: "共用群組",
      type: "select",
      required: true,
      options: USAGE_GROUP_OPTIONS,
      selectContentProps: {
        className: "max-h-[300px] overflow-y-auto",
      },
    },
    {
      key: "status",
      label: "設備狀態",
      type: "select",
      required: true,
      options: STATUS_OPTIONS,
    },
    {
      key: "ratedPower",
      label: "額定功率",
      type: "number",
      required: true,
    },
    {
      key: "actualPower",
      label: "實際能耗",
      type: "number",
    },
    {
      key: "powerUnit",
      label: "能耗單位",
      type: "text",
      required: true,
    },
    {
      key: "assetNumber",
      label: "資產編號",
      type: "text",
    },
    {
      key: "quantity",
      label: "數量",
      type: "number",
      required: true,
    },
    {
      key: "note",
      label: "備註",
      type: "text",
    },
  ];

  const columns = useMemo<MRT_ColumnDef<Equipment>[]>(
    () => [
      {
        accessorKey: "code",
        header: "設備編號",
        size: 110,
        Header: () => (
          <Tooltip title="設備編號" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>設備編號</span>
            </div>
          </Tooltip>
        ),
      },
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
        accessorKey: "referenceCode",
        header: "參考設備",
        size: 110,
        Header: () => (
          <Tooltip title="參考設備" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>參考設備</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "manufacturer",
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
        accessorKey: "equipmentType",
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
        accessorKey: "workArea",
        header: "工作場域",
        size: 110,
        Header: () => (
          <Tooltip title="工作場域" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>工作場域</span>
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
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const option = DEPARTMENT_OPTIONS.find((opt) => opt.value === value);
          return option ? option.label : value;
        },
      },
      {
        accessorKey: "usageGroup",
        header: "共用群組",
        size: 110,
        Header: () => (
          <Tooltip title="共用群組" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>共用群組</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "status",
        header: "設備狀態",
        size: 110,
        Header: () => (
          <Tooltip title="設備狀態" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>設備狀態</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "ratedPower",
        header: "額定功率",
        size: 110,
        Header: () => (
          <Tooltip title="額定功率" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>額定功率</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "actualPower",
        header: "實際能耗",
        size: 110,
        Header: () => (
          <Tooltip title="實際能耗" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>實際能耗</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "powerUnit",
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
        accessorKey: "assetNumber",
        header: "資產編號",
        size: 110,
        Header: () => (
          <Tooltip title="資產編號" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>資產編號</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "quantity",
        header: "數量",
        size: 80,
        Header: () => (
          <Tooltip title="數量" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>數量</span>
            </div>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    setEditingEquipment({
      department: "(未設定)",
      powerUnit: "度",
      quantity: 1,
    } as Equipment);
    setDialogOpen(true);
  };

  const handleEdit = (row: Equipment) => {
    setEditingEquipment(row);
    setDialogOpen(true);
  };

  const handleDelete = (row: Equipment) => {
    setDeleteConfirm(row);
  };

  const handleSubmit = async (data: Omit<Equipment, "id">) => {
    try {
      const response = await fetch("/api/energy-equipment", {
        method: editingEquipment ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: editingEquipment?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save equipment");
      }

      const result = await response.json();

      if (editingEquipment) {
        setEquipments((prev) =>
          prev.map((equipment) =>
            equipment.id === editingEquipment.id ? result.equipment : equipment
          )
        );
      } else {
        setEquipments((prev) => [...prev, result.equipment]);
      }

      setDialogOpen(false);
      setEditingEquipment(undefined);
    } catch (error) {
      console.error("Failed to save equipment:", error);
    }
  };

  const handleDeleteConfirmed = async (equipment: Equipment) => {
    try {
      const response = await fetch(`/api/energy-equipment/${equipment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete equipment");
      }

      setEquipments((prev) => prev.filter((e) => e.id !== equipment.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete equipment:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <DataGrid
        title="能源設備管理"
        data={equipments}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DetailDialog<Equipment>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingEquipment}
        mode={editingEquipment ? "edit" : "create"}
        title="能源設備"
        description="能源設備"
        fields={fields}
        showDeviceReference={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除設備</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除設備 &ldquo;{deleteConfirm?.name}&rdquo; 嗎？
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

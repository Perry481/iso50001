import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "@/components/DataGrid";
import { DetailDialog, type Field } from "@/components/dialogs/DetailDialog";
import Tooltip from "@mui/material/Tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EnergySubject {
  id?: string | number;
  EnergyGroupID: string;
  EnergyGroupName: string;
  Remark: string;
  CreatedTime: string | null;
  UpdatedTime: string | null;
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
    key: "EnergyGroupID",
    label: "群組編號",
    type: "text",
    required: true,
  },
  {
    key: "EnergyGroupName",
    label: "群組名稱",
    type: "text",
    required: true,
  },
  {
    key: "Remark",
    label: "備註",
    type: "text",
  },
];

export default function EnergySubjectSettings() {
  const [data, setData] = useState<EnergySubject[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EnergySubject | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<EnergySubject | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/energy-subject-settings");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const columns = useMemo<MRT_ColumnDef<EnergySubject>[]>(
    () => [
      {
        accessorKey: "EnergyGroupID",
        header: "群組編號",
        size: 110,
        Header: () => (
          <Tooltip title="群組編號" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>群組編號</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "EnergyGroupName",
        header: "群組名稱",
        size: 140,
        Header: () => (
          <Tooltip title="群組名稱" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>群組名稱</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "Remark",
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
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (row: EnergySubject) => {
    setEditingItem(row);
    setDialogOpen(true);
  };

  const handleDelete = (row: EnergySubject) => {
    setDeleteConfirm(row);
  };

  const handleDeleteConfirmed = async (item: EnergySubject) => {
    try {
      // TODO: Implement actual API call for deletion
      // For now, just update the UI state
      setData((prev) =>
        prev.filter((i) => i.EnergyGroupID !== item.EnergyGroupID)
      );
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleSubmit = async (formData: Omit<EnergySubject, "id">) => {
    try {
      // TODO: Implement actual API call for create/update
      // For now, mock the API response with local state updates
      if (editingItem) {
        // Update existing item
        const updatedItem = {
          ...formData,
          id: editingItem.id,
          CreatedTime: editingItem.CreatedTime,
          UpdatedTime: new Date().toISOString(),
        };
        setData((prev) =>
          prev.map((item) =>
            item.EnergyGroupID === editingItem.EnergyGroupID
              ? updatedItem
              : item
          )
        );
      } else {
        // Create new item with a temporary ID
        const newItem = {
          ...formData,
          id: `temp_${Date.now()}`,
          CreatedTime: new Date().toISOString(),
          UpdatedTime: new Date().toISOString(),
        };
        setData((prev) => [...prev, newItem]);
      }

      setDialogOpen(false);
      setEditingItem(undefined);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <DataGrid
        title="共用設備群組管理"
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DetailDialog<EnergySubject>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? "edit" : "create"}
        title="共用設備群組"
        description="共用設備群組"
        fields={fields}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除群組</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除群組 &ldquo;{deleteConfirm?.EnergyGroupName}&rdquo; 嗎？
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

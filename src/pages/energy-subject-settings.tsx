import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "@/components/DataGrid";
import { DetailDialog, type Field } from "@/components/dialogs/DetailDialog";
import Tooltip from "@mui/material/Tooltip";

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

  const handleDelete = async (row: EnergySubject) => {
    if (!confirm("確定要刪除此項目嗎？")) return;

    try {
      const response = await fetch(
        `/api/energy-subject-settings?id=${row.EnergyGroupID}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete item");

      setData((prev) =>
        prev.filter((item) => item.EnergyGroupID !== row.EnergyGroupID)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSubmit = async (formData: Omit<EnergySubject, "id">) => {
    try {
      const response = await fetch("/api/energy-subject-settings", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save item");

      const result = await response.json();

      if (editingItem) {
        setData((prev) =>
          prev.map((item) =>
            item.EnergyGroupID === editingItem.EnergyGroupID ? result : item
          )
        );
      } else {
        setData((prev) => [...prev, result]);
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
    </div>
  );
}

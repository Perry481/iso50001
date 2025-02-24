import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "@/components/DataGrid";
import { DetailDialog, type Field } from "@/components/dialogs/DetailDialog";
import Tooltip from "@mui/material/Tooltip";
import { getSubjects } from "@/lib/energy-subject/service";
import { useCompany } from "@/contexts/CompanyContext";
import type { EnergySubject } from "@/lib/energy-subject/types";
import { getApiUrl } from "@/lib/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export default function EnergySubjectSettings() {
  const [subjects, setSubjects] = useState<EnergySubject[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<
    EnergySubject | undefined
  >();
  const [deleteConfirm, setDeleteConfirm] = useState<EnergySubject | null>(
    null
  );
  const { companyName, isSchemaInitialized } = useCompany();

  const fields: Field[] = [
    {
      key: "code",
      label: "群組編號",
      type: "text",
      required: true,
      disabled: Boolean(editingSubject?.id),
    },
    {
      key: "name",
      label: "群組名稱",
      type: "text",
      required: true,
    },
    {
      key: "note",
      label: "備註",
      type: "text",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!isSchemaInitialized) return;

      try {
        const data = await getSubjects(companyName);
        setSubjects(data);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [companyName, isSchemaInitialized]);

  const columns = useMemo<MRT_ColumnDef<EnergySubject>[]>(
    () => [
      {
        accessorKey: "code",
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
        accessorKey: "name",
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
    setEditingSubject(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (row: EnergySubject) => {
    setEditingSubject({
      ...row,
      id: row.code,
    });
    setDialogOpen(true);
  };

  const handleDelete = (row: EnergySubject) => {
    setDeleteConfirm(row);
  };

  const handleSubmit = async (data: Omit<EnergySubject, "id">) => {
    try {
      const isEditing = Boolean(editingSubject?.id);
      const requestBody = isEditing
        ? {
            ...data,
            id: editingSubject!.id,
          }
        : data;

      const response = await fetch(
        getApiUrl(`energy-subject-settings?company=${companyName}`),
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save subject");
      }

      setSubjects(result.subjects);
      setDialogOpen(false);
      setEditingSubject(undefined);
    } catch (error) {
      console.error("Failed to save subject:", error);
    }
  };

  const handleDeleteConfirmed = async (subject: EnergySubject) => {
    try {
      const response = await fetch(
        getApiUrl(
          `energy-subject-settings?company=${companyName}&id=${subject.id}`
        ),
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete subject");
      }

      setSubjects(result.subjects);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete subject:", error);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <DataGrid
        title="共用設備群組管理"
        data={subjects}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DetailDialog<EnergySubject>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingSubject}
        mode={editingSubject ? "edit" : "create"}
        title="共用設備群組"
        description="共用設備群組"
        fields={fields}
      />

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除群組</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除群組 &ldquo;{deleteConfirm?.name}&rdquo; 嗎？
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

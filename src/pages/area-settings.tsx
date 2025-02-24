"use client";

import { useState, useEffect, useMemo } from "react";
import { type MRT_ColumnDef } from "material-react-table";
import { DataGrid } from "../components/DataGrid";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Field } from "../components/dialogs/DetailDialog";
import { deptListService } from "@/lib/dept-list/service";
import { getApiUrl } from "@/lib/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useCompany } from "@/contexts/CompanyContext";

export interface Area {
  id?: string | number;
  code: string;
  name: string;
  department: string;
  meterNumber?: string;
  note?: string;
}

export interface Department {
  id?: string;
  departId: string;
  departName: string;
  engName: string;
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | undefined>();
  const [editingDepartment, setEditingDepartment] = useState<
    Department | undefined
  >();
  const [deleteConfirm, setDeleteConfirm] = useState<Area | null>(null);
  const [deleteDepartmentConfirm, setDeleteDepartmentConfirm] =
    useState<Department | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const { companyName, isSchemaInitialized } = useCompany();

  useEffect(() => {
    const loadData = async () => {
      if (!isSchemaInitialized) return;

      try {
        // Load areas
        const areasResponse = await fetch(
          getApiUrl(`area-settings?company=${companyName}`)
        );
        const areasData = await areasResponse.json();

        if (!areasResponse.ok) {
          throw new Error(areasData.error || "Failed to load areas");
        }

        setAreas(areasData.areas);

        // Load departments
        const departmentsResponse = await fetch(
          getApiUrl(`department?company=${companyName}`)
        );
        const departmentsData = await departmentsResponse.json();

        if (!departmentsResponse.ok) {
          throw new Error(
            departmentsData.error || "Failed to load departments"
          );
        }

        setDepartments(departmentsData.departments);

        const depts = await deptListService.getDepts();
        setDepartmentOptions(depts);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [companyName, isSchemaInitialized]);

  const fields: Field[] = [
    {
      key: "code",
      label: "場域編號",
      type: "text",
      required: true,
      disabled: Boolean(editingArea?.id),
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
        accessorFn: (row) => {
          if (!row.department || row.department === "(未設定)")
            return "(未設定)";
          const dept = departmentOptions.find(
            (d) => d.value === row.department
          );
          return dept?.label || row.department;
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

  const departmentFields: Field[] = [
    {
      key: "departId",
      label: "部門編號",
      type: "text",
      required: true,
      disabled: Boolean(editingDepartment?.id),
    },
    {
      key: "departName",
      label: "部門名稱",
      type: "text",
      required: true,
    },
    {
      key: "engName",
      label: "英文名稱",
      type: "text",
    },
  ];

  const departmentColumns = useMemo<MRT_ColumnDef<Department>[]>(
    () => [
      {
        accessorKey: "departId",
        header: "部門編號",
        size: 110,
        Header: () => (
          <Tooltip title="部門編號" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>部門編號</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "departName",
        header: "部門名稱",
        size: 140,
        Header: () => (
          <Tooltip title="部門名稱" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>部門名稱</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "engName",
        header: "英文名稱",
        size: 140,
        Header: () => (
          <Tooltip title="英文名稱" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>英文名稱</span>
            </div>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    setEditingArea({
      department: "(未設定)",
    } as Area);
    setDialogOpen(true);
  };

  const handleEdit = (row: Area) => {
    setEditingArea({
      ...row,
      id: row.code,
    });
    setDialogOpen(true);
  };

  const handleDelete = (row: Area) => {
    setDeleteConfirm(row);
  };

  const handleSubmit = async (data: Omit<Area, "id">) => {
    try {
      const isEditing = Boolean(editingArea?.id);
      const requestBody = isEditing
        ? {
            ...data,
            id: editingArea!.id,
          }
        : data;

      const response = await fetch(
        getApiUrl(`area-settings?company=${companyName}`),
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
        throw new Error(result.error || "Failed to save area");
      }

      setAreas(result.areas);
      setDialogOpen(false);
      setEditingArea(undefined);
    } catch (error) {
      console.error("Failed to save area:", error);
    }
  };

  const handleDeleteConfirmed = async (area: Area) => {
    try {
      const response = await fetch(
        getApiUrl(`area-settings?company=${companyName}&id=${area.id}`),
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete area");
      }

      setAreas(result.areas);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete area:", error);
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment({} as Department);
    setDepartmentDialogOpen(true);
  };

  const handleEditDepartment = (row: Department) => {
    setEditingDepartment({
      ...row,
      id: row.departId,
    });
    setDepartmentDialogOpen(true);
  };

  const handleDeleteDepartment = (row: Department) => {
    setDeleteDepartmentConfirm(row);
  };

  const handleSubmitDepartment = async (data: Omit<Department, "id">) => {
    try {
      const isEditing = Boolean(editingDepartment?.id);
      const requestBody = isEditing
        ? {
            ...data,
            id: editingDepartment!.id,
          }
        : data;

      const response = await fetch(
        getApiUrl(`department?company=${companyName}`),
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
        throw new Error(result.error || "Failed to save department");
      }

      setDepartments(result.departments);
      setDepartmentDialogOpen(false);
      setEditingDepartment(undefined);
    } catch (error) {
      console.error("Failed to save department:", error);
    }
  };

  const handleDeleteDepartmentConfirmed = async (department: Department) => {
    try {
      const response = await fetch(
        getApiUrl(`department?company=${companyName}&id=${department.id}`),
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete department");
      }

      setDepartments(result.departments);
      setDeleteDepartmentConfirm(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  };

  return (
    <div className="p-2 space-y-8">
      {departmentOptions.length > 0 && (
        <DataGrid
          title="工作場域管理"
          data={areas}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          initialState={{
            pagination: {
              pageSize: 5,
            },
          }}
        />
      )}

      <DataGrid
        title="部門管理"
        data={departments}
        columns={departmentColumns}
        onAdd={handleAddDepartment}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
        initialState={{
          pagination: {
            pageSize: 5,
          },
        }}
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

      <DetailDialog<Department>
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        onSubmit={handleSubmitDepartment}
        initialData={editingDepartment}
        mode={editingDepartment ? "edit" : "create"}
        title="部門"
        description="部門"
        fields={departmentFields}
      />

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除場域</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除場域 &ldquo;{deleteConfirm?.name}&rdquo;？
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

      <Dialog
        open={!!deleteDepartmentConfirm}
        onOpenChange={() => setDeleteDepartmentConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除部門</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除部門 &ldquo;{deleteDepartmentConfirm?.departName}
            &rdquo;？
            <br />
            此操作無法復原。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDepartmentConfirm(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDepartmentConfirm &&
                handleDeleteDepartmentConfirmed(deleteDepartmentConfirm)
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

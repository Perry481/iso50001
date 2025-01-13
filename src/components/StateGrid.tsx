import {
  MaterialReactTable,
  type MRT_RowData,
  type MRT_Row,
  type MRT_Cell,
} from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { X } from "lucide-react";

interface SEUStateData extends MRT_RowData {
  equipmentName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
}

interface StateGridProps {
  data: SEUStateData[];
  title?: string;
  nameHeader?: string;
  onStateChange?: (row: SEUStateData) => void;
}

export function StateGrid({
  data,
  title,
  nameHeader = "設備名稱",
  onStateChange,
}: StateGridProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    row?: SEUStateData;
  }>({ open: false });

  const handleStateChangeClick = (row: SEUStateData) => {
    setConfirmDialog({ open: true, row });
  };

  const handleConfirm = () => {
    if (confirmDialog.row && onStateChange) {
      onStateChange(confirmDialog.row);
    }
    setConfirmDialog({ open: false });
  };

  const columns = [
    {
      accessorKey: "equipmentName",
      header: nameHeader,
      size: 200,
      enableResizing: true,
      muiTableHeadCellProps: {
        title: nameHeader,
        sx: {
          "&:hover::after": {
            content: '""',
            position: "absolute",
            bottom: "-5px",
            left: "0",
            width: "100%",
            height: "2px",
            backgroundColor: "#94a3b8",
          },
        },
      },
    },
    {
      accessorKey: "KW",
      header: "KW",
      size: 120,
      enableResizing: true,
      muiTableHeadCellProps: {
        title: "KW",
        sx: {
          "&:hover::after": {
            content: '""',
            position: "absolute",
            bottom: "-5px",
            left: "0",
            width: "100%",
            height: "2px",
            backgroundColor: "#94a3b8",
          },
        },
      },
      Cell: ({ cell }: { cell: MRT_Cell<SEUStateData> }) =>
        cell.getValue<number>().toFixed(2),
    },
    {
      accessorKey: "percentage",
      header: "占總量比例(%)",
      size: 120,
      enableResizing: true,
      muiTableHeadCellProps: {
        title: "占總量比例(%)",
        sx: {
          "&:hover::after": {
            content: '""',
            position: "absolute",
            bottom: "-5px",
            left: "0",
            width: "100%",
            height: "2px",
            backgroundColor: "#94a3b8",
          },
        },
      },
      Cell: ({ cell }: { cell: MRT_Cell<SEUStateData> }) =>
        cell.getValue<number>().toFixed(2),
    },
    {
      accessorKey: "IsSEU",
      header: "列入SEU",
      size: 100,
      enableSorting: false,
      enableResizing: false,
      muiTableHeadCellProps: {
        title: "列入SEU",
        sx: {
          "&:hover::after": {
            content: '""',
            position: "absolute",
            bottom: "-5px",
            left: "0",
            width: "100%",
            height: "2px",
            backgroundColor: "#94a3b8",
          },
        },
      },
      Cell: ({ row }: { row: MRT_Row<SEUStateData> }) => (
        <div className="flex justify-center">
          <Switch
            checked={row.original.status !== "取消"}
            onCheckedChange={() => handleStateChangeClick(row.original)}
          />
        </div>
      ),
    },
  ];

  // Create theme
  const theme = createTheme({
    palette: {
      background: {
        default: "#ffffff",
      },
    },
    components: {
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              backgroundColor: "#f9fafb",
            },
          },
        },
      },
    },
  });

  return (
    <div>
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      <ThemeProvider theme={theme}>
        <MaterialReactTable
          columns={columns}
          data={data}
          enableColumnActions={false}
          enableColumnFilters={false}
          enablePagination={false}
          enableTopToolbar={false}
          enableBottomToolbar={false}
          enableRowSelection={false}
          enableRowActions={false}
          enableColumnResizing
          columnResizeMode="onChange"
          muiTableBodyRowProps={{ hover: true }}
          muiTableProps={{
            sx: {
              tableLayout: "fixed",
            },
          }}
          muiTableContainerProps={{
            sx: {
              maxHeight: "300px",
              overflowY: "auto",
            },
          }}
          initialState={{
            density: "compact",
          }}
        />
      </ThemeProvider>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open })}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden DialogContent">
          <DialogClose className="absolute" data-dialog-close="true">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-center">
              確認更改狀態
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <div className="text-gray-600 leading-6 text-center">
              <p className="mb-2">
                您確定要{confirmDialog.row?.status === "取消" ? "啟用" : "取消"}
              </p>
              <div className="max-w-[300px] mx-auto">
                <p className="truncate mb-2">
                  &ldquo;{confirmDialog.row?.equipmentName}&rdquo;
                </p>
              </div>
              <p>嗎？</p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false })}
              >
                取消
              </Button>
              <Button onClick={handleConfirm}>確認</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

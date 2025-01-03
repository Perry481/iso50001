import {
  MaterialReactTable,
  type MRT_RowData,
  type MRT_Row,
  type MRT_Cell,
} from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material";
import { Switch } from "./ui/switch";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState, useCallback } from "react";

interface SEUGroupData extends MRT_RowData {
  groupName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
}

interface GroupGridProps {
  data: SEUGroupData[];
  title?: string;
  onStateChange?: (row: SEUGroupData) => void;
}

export function GroupGrid({ data, title, onStateChange }: GroupGridProps) {
  const BASE_COLUMN_WIDTH = 110;
  const MIN_COLUMN_WIDTH = 55;
  const MAX_COLUMN_WIDTH = 275;
  const ZOOM_STEP = 11;
  const [columnWidth, setColumnWidth] = useState(BASE_COLUMN_WIDTH);

  const handleCompressView = () => {
    setColumnWidth((prev) => Math.max(MIN_COLUMN_WIDTH, prev - ZOOM_STEP));
  };

  const handleExpandView = () => {
    setColumnWidth((prev) => Math.min(MAX_COLUMN_WIDTH, prev + ZOOM_STEP));
  };

  const columnsWithWidth = useCallback(() => {
    const columns = [
      {
        accessorKey: "groupName",
        header: "群組名稱",
        size: 200,
      },
      {
        accessorKey: "KW",
        header: "KW",
        size: 120,
        Cell: ({ cell }: { cell: MRT_Cell<SEUGroupData> }) =>
          cell.getValue<number>().toFixed(2),
      },
      {
        accessorKey: "percentage",
        header: "占總量比例(%)",
        size: 120,
        Cell: ({ cell }: { cell: MRT_Cell<SEUGroupData> }) =>
          cell.getValue<number>().toFixed(2),
      },
      {
        accessorKey: "IsSEU",
        header: "列入SEU",
        size: 100,
        enableSorting: false,
        enableResizing: false,
        Cell: ({ row }: { row: MRT_Row<SEUGroupData> }) => (
          <div className="flex justify-center">
            <Switch
              checked={row.original.status !== "取消"}
              onCheckedChange={() => onStateChange?.(row.original)}
            />
          </div>
        ),
      },
    ];

    return columns.map((col) => ({
      ...col,
      size: columnWidth + (col.size ? col.size - BASE_COLUMN_WIDTH : 0),
    }));
  }, [columnWidth, onStateChange, BASE_COLUMN_WIDTH]);

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
      <div className="flex justify-between items-center mb-2">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        <div className="flex gap-2">
          <ZoomOut
            className="w-6 h-6 cursor-pointer"
            onClick={handleCompressView}
          />
          <ZoomIn
            className="w-6 h-6 cursor-pointer"
            onClick={handleExpandView}
          />
        </div>
      </div>
      <ThemeProvider theme={theme}>
        <MaterialReactTable
          columns={columnsWithWidth()}
          data={data}
          enableColumnActions={false}
          enableColumnFilters={false}
          enablePagination={false}
          enableTopToolbar={false}
          enableBottomToolbar={false}
          enableRowSelection={false}
          enableRowActions={false}
          muiTableBodyRowProps={{ hover: true }}
          muiTableProps={{
            sx: {
              tableLayout: "fixed",
            },
          }}
        />
      </ThemeProvider>
    </div>
  );
}

import {
  MaterialReactTable,
  type MRT_RowData,
  type MRT_Row,
  type MRT_Cell,
} from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material";
import { Switch } from "./ui/switch";

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
      Cell: ({ cell }: { cell: MRT_Cell<SEUStateData> }) => (
        <div title={cell.getValue<string>()}>{cell.getValue<string>()}</div>
      ),
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
            onCheckedChange={() => onStateChange?.(row.original)}
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
    </div>
  );
}

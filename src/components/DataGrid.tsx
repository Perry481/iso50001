import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
} from "material-react-table";
import { ThemeProvider, createTheme } from "@mui/material";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, Pencil, Trash2, Plus } from "lucide-react";
import { useState, useCallback } from "react";

interface DataGridProps<T extends MRT_RowData> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  title?: string;
  onBack?: () => void;
  expandableColumns?: string[];
  initialState?: {
    pagination?: {
      pageSize?: number;
      pageIndex?: number;
    };
    density?: "compact" | "comfortable" | "spacious";
  };
}

export function DataGrid<T extends MRT_RowData>({
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  title,
  onBack,
  expandableColumns = [],
  initialState,
}: DataGridProps<T>) {
  const BASE_COLUMN_WIDTH = 110;
  const MIN_COLUMN_WIDTH = 55;
  const MAX_COLUMN_WIDTH = 275;
  const ZOOM_STEP = 11;
  const [columnWidth, setColumnWidth] = useState(BASE_COLUMN_WIDTH);
  const [expandedColumns, setExpandedColumns] = useState<
    Record<string, boolean>
  >({});

  const handleCompressView = () => {
    setColumnWidth((prev) => Math.max(MIN_COLUMN_WIDTH, prev - ZOOM_STEP));
  };

  const handleExpandView = () => {
    setColumnWidth((prev) => Math.min(MAX_COLUMN_WIDTH, prev + ZOOM_STEP));
  };

  // Update column sizes based on columnWidth
  const columnsWithWidth = useCallback(
    () =>
      columns.map((col) => ({
        ...col,
        size: columnWidth + (col.size ? col.size - BASE_COLUMN_WIDTH : 0),
        muiTableBodyCellProps: {
          sx: {
            padding: expandedColumns[col.accessorKey as string]
              ? "12px"
              : "4px 12px",
            borderRight: "1px solid #e2e8f0",
            "&:last-child": {
              borderRight: "1px solid #e2e8f0",
            },
            ...(expandedColumns[col.accessorKey as string] && {
              maxWidth: "400px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }),
          },
        },
      })),
    [columns, columnWidth, expandedColumns]
  );

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

  const processColumns = useCallback(() => {
    return columnsWithWidth().map((col) => ({
      ...col,
      Cell: ({
        cell,
      }: {
        cell: { getValue: () => string | number | null | undefined };
      }) => {
        const value = cell.getValue();
        const columnKey = col.accessorKey as string;
        const isExpanded = expandedColumns[columnKey];

        if (expandableColumns.includes(columnKey) && value) {
          const truncatedValue =
            typeof value === "string" && value.length > 50 && !isExpanded
              ? value.slice(0, 50) + "..."
              : value;

          const handleToggleExpand = () => {
            setExpandedColumns((prev) => ({
              ...prev,
              [columnKey]: !prev[columnKey],
            }));
          };

          return (
            <div
              className={`cursor-pointer hover:text-blue-600 ${
                isExpanded
                  ? "whitespace-pre-wrap break-words min-h-[50px] max-w-[400px]"
                  : "whitespace-nowrap"
              }`}
              onClick={handleToggleExpand}
              title={isExpanded ? "點擊折疊" : "點擊展開"}
              style={{
                padding: isExpanded ? "8px 0" : undefined,
              }}
            >
              {truncatedValue}
              {typeof value === "string" && value.length > 50 && (
                <span className="ml-1 text-xs text-blue-500">
                  {isExpanded ? "(收合)" : "(展開)"}
                </span>
              )}
            </div>
          );
        }
        return value;
      },
    }));
  }, [columnsWithWidth, expandableColumns, expandedColumns]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
            >
              返回列表
            </Button>
          )}
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCompressView}
            disabled={columnWidth <= MIN_COLUMN_WIDTH}
            className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 min-w-[4rem] text-center">
            {Math.round((columnWidth / BASE_COLUMN_WIDTH) * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExpandView}
            disabled={columnWidth >= MAX_COLUMN_WIDTH}
            className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {onAdd && (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4 mr-2" /> 新增項目
            </Button>
          )}
        </div>
      </div>

      <ThemeProvider theme={theme}>
        <MaterialReactTable
          columns={processColumns()}
          data={data}
          enableColumnActions={false}
          enableColumnFilters={false}
          enableTopToolbar={false}
          enableStickyHeader
          enablePagination
          enableColumnResizing
          muiTableContainerProps={{
            sx: {
              maxHeight: "calc(75vh - 20px)",
            },
          }}
          muiPaginationProps={{
            rowsPerPageOptions: [5, 10, 20, 50],
            showFirstButton: true,
            showLastButton: true,
            sx: {
              marginTop: "4px",
            },
          }}
          localization={{
            rowsPerPage: "每頁行數",
            of: "/",
            noResultsFound: "沒有找到結果",
            noRecordsToDisplay: "沒有記錄可顯示",
          }}
          initialState={{
            pagination: {
              pageSize: Number(initialState?.pagination?.pageSize) || 10,
              pageIndex: Number(initialState?.pagination?.pageIndex) || 0,
            },
            density: initialState?.density ?? "compact",
          }}
          muiTablePaperProps={{
            sx: {
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              width: "100%",
              overflow: "hidden",
            },
          }}
          defaultColumn={{
            minSize: 50,
            maxSize: 1000,
            size: columnWidth,
            muiTableHeadCellProps: {
              sx: {
                whiteSpace: "normal",
                height: "40px",
                padding: "0 12px",
                backgroundColor: "#f8fafc",
                fontWeight: "600",
                fontSize: "0.875rem",
                color: "#475569",
                borderRight: "1px solid #e2e8f0",
                borderBottom: "1px solid #e2e8f0",
                display: "flex !important",
                alignItems: "center !important",
                justifyContent: "center",
                "&:last-child": {
                  borderRight: "1px solid #e2e8f0",
                },
                "& .Mui-TableHeadCell-Content": {
                  width: "100%",
                  display: "flex",
                  alignItems: "center !important",
                  justifyContent: "center",
                  padding: "0",
                  textAlign: "center",
                  margin: "0",
                },
                "& .Mui-TableHeadCell-ResizeHandle": {
                  width: "1px",
                  right: "0",
                  height: "100%",
                  position: "absolute",
                  cursor: "col-resize",
                  touchAction: "none",
                  opacity: 0,
                  "&:hover, &.isResizing": {
                    opacity: 1,
                    backgroundColor: "#94a3b8",
                    width: "3px",
                    right: "-1.5px",
                  },
                },
              },
            },
            muiTableBodyCellProps: {
              sx: {
                padding: "4px 12px",
                borderRight: "1px solid #e2e8f0",
                "&:last-child": {
                  borderRight: "1px solid #e2e8f0",
                },
              },
            },
          }}
          columnResizeMode="onChange"
          enableRowActions={!!(onEdit || onDelete)}
          displayColumnDefOptions={{
            "mrt-row-actions": {
              header: "操作",
              size: 100,
              muiTableHeadCellProps: {
                align: "center",
                sx: {
                  borderRight: "1px solid #e2e8f0",
                },
              },
              muiTableBodyCellProps: {
                align: "center",
                sx: {
                  borderRight: "1px solid #e2e8f0",
                },
              },
            },
          }}
          renderRowActions={({ row }) => (
            <div className="flex items-center justify-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(row.original)}
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          )}
        />
      </ThemeProvider>
    </div>
  );
}

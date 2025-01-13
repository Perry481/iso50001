import { useEffect, useState, useMemo } from "react";
import { BaselineListing } from "@/components/BaselineListing";
import {
  BaselineDialog,
  BaselineFormData,
} from "@/components/dialogs/BaselineDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataGrid } from "@/components/DataGrid";
import { type MRT_ColumnDef, MRT_Cell } from "material-react-table";
import Tooltip from "@mui/material/Tooltip";
import { DetailDialog, type Field } from "@/components/dialogs/DetailDialog";
import { RegressionAnalysis } from "@/components/RegressionAnalysis";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactECharts from "echarts-for-react";

interface ENBData {
  baselineCode: string;
  targetItem: string;
  energyType: string;
  workArea: string;
  sharedGroup: string;
  locked: string;
  note: string;
  X1: string;
  X2: string;
  X3?: string;
  X4?: string;
  X5?: string;
}

interface BaselineData {
  id?: string | number;
  date: string;
  value: number;
  X1: number;
  X2?: number;
  X3?: number;
  X4?: number;
  X5?: number;
}

interface RegressionData {
  quadratic: {
    a: number;
    b: number;
    c: number;
    y: string;
    rSquare: number;
  };
  linear: {
    X1Label: string;
    X2Label: string;
    X3Label: string;
    X1Coefficient: number;
    X2Coefficient: number;
    X3Coefficient: number;
    constant: number;
    equation: string;
    rSquare: number;
    MBE: number;
    MBEPercentage: number;
    MAE: number;
    MAEPercentage: number;
    RMSE: number;
    CvRMSE: number;
    maxError: number;
  };
}

interface BaselineComparison {
  date: string;
  actualValue: number;
  theoreticalValue: number;
}

interface BaselineDetails {
  baselineData: BaselineData[];
  regressionData: RegressionData;
  chartData: Record<string, ChartData>;
  comparisonData: BaselineComparison[];
}

interface ChartData {
  Data: [number, number, number][];
  Unit: string;
  Caption: string;
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

const baselineDetailFields: Field[] = [
  {
    key: "date",
    label: "期別",
    type: "date",
    required: true,
  },
  {
    key: "value",
    label: "監測值",
    type: "number",
    required: true,
  },
  {
    key: "X1",
    label: "X1",
    type: "number",
    required: true,
  },
  {
    key: "X2",
    label: "X2",
    type: "number",
    required: true,
  },
  {
    key: "X3",
    label: "X3",
    type: "number",
  },
  {
    key: "X4",
    label: "X4",
    type: "number",
  },
  {
    key: "X5",
    label: "X5",
    type: "number",
  },
];

export default function ENB() {
  const [items, setItems] = useState<ENBData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<ENBData | null>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data?: ENBData;
  }>({
    open: false,
    mode: "create",
  });
  const [showListing, setShowListing] = useState(true);
  const [selectedBaseline, setSelectedBaseline] = useState<ENBData | null>(
    null
  );
  const [baselineDetails, setBaselineDetails] = useState<
    Record<string, BaselineDetails>
  >({});
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<
    BaselineData | undefined
  >();
  const [selectedX, setSelectedX] = useState<string>("X1");

  const columns = useMemo<MRT_ColumnDef<BaselineData>[]>(() => {
    const baseColumns = [
      {
        accessorKey: "date",
        header: "期別",
        size: 110,
        Header: () => (
          <Tooltip title="期別" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>期別</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "value",
        header: "監測值",
        size: 110,
        Header: () => (
          <Tooltip title="監測值" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>監測值</span>
            </div>
          </Tooltip>
        ),
      },
    ];

    const xColumns = ["X1", "X2", "X3", "X4", "X5"].map((key) => ({
      accessorKey: key,
      header: key,
      size: 110,
      Header: () => (
        <Tooltip
          title={selectedBaseline?.[key as keyof ENBData] || key}
          {...tooltipProps}
        >
          <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
            <span>{key}</span>
          </div>
        </Tooltip>
      ),
      Cell: ({ cell }: { cell: MRT_Cell<BaselineData> }) => {
        const value = cell.getValue();
        return typeof value === "number" ? value.toFixed(2) : "-";
      },
      enableEditing: selectedBaseline
        ? selectedBaseline[key as keyof ENBData] !== "未使用" &&
          selectedBaseline[key as keyof ENBData] !== ""
        : true,
    }));

    return [...baseColumns, ...xColumns];
  }, [selectedBaseline]);

  const getActiveDetailFields = useMemo(() => {
    if (!selectedBaseline) return baselineDetailFields;

    return baselineDetailFields.filter((field) => {
      if (field.key === "date" || field.key === "value") return true;
      return (
        selectedBaseline[field.key as keyof ENBData] !== "未使用" &&
        selectedBaseline[field.key as keyof ENBData] !== ""
      );
    });
  }, [selectedBaseline]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/enb");
        const result = await response.json();
        setItems(result.data);
        setBaselineDetails(result.baselineDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    setDialogState({
      open: true,
      mode: "create",
    });
  };

  const handleEditItem = (item: ENBData) => {
    setDialogState({
      open: true,
      mode: "edit",
      data: item,
    });
  };

  const handleDeleteItem = (item: ENBData) => {
    setDeleteConfirm(item);
  };

  const handleDeleteConfirmed = async (item: ENBData) => {
    // TODO: Implement delete functionality
    console.log("Delete item:", item);
    setDeleteConfirm(null);
  };

  const handleSubmit = async (formData: BaselineFormData) => {
    // Convert BaselineFormData back to ENBData
    const enbData: ENBData = {
      baselineCode: formData.baselineCode,
      targetItem: formData.targetItem,
      energyType: formData.energyType,
      workArea: formData.workArea,
      sharedGroup: formData.sharedGroup,
      locked: formData.locked,
      note: formData.note,
      X1: formData.X1,
      X2: formData.X2,
      X3: formData.X3,
      X4: formData.X4,
      X5: formData.X5,
    };

    console.log("Submit data:", enbData);
    if (dialogState.mode === "create") {
      // Add new item
      setItems([...items, enbData]);
    } else {
      // Update existing item
      setItems(
        items.map((item) =>
          item.baselineCode === enbData.baselineCode ? enbData : item
        )
      );
    }
  };

  // Convert ENBData to BaselineFormData
  const getDialogData = (data?: ENBData) => {
    if (!data) return undefined;
    return {
      ...data,
      X1State: data.X1 !== "未使用" && data.X1 !== "",
      X2State: data.X2 !== "未使用" && data.X2 !== "",
      X3State: data.X3 !== "未使用" && data.X3 !== "",
      X4State: data.X4 !== "未使用" && data.X4 !== "",
      X5State: data.X5 !== "未使用" && data.X5 !== "",
    };
  };

  const handleBaselineClick = (baseline: ENBData) => {
    setSelectedBaseline(baseline);
    setShowListing(false);
  };

  const handleAddDetail = () => {
    setEditingDetail(undefined);
    setDetailDialogOpen(true);
  };

  const handleEditDetail = (row: BaselineData) => {
    setEditingDetail(row);
    setDetailDialogOpen(true);
  };

  const handleDeleteDetail = async (row: BaselineData) => {
    if (
      !selectedBaseline ||
      !currentBaselineDetails ||
      !confirm("確定要刪除此筆資料嗎？")
    )
      return;

    setBaselineDetails((prev) => ({
      ...prev,
      [selectedBaseline.baselineCode]: {
        ...currentBaselineDetails,
        baselineData: currentBaselineDetails.baselineData.filter(
          (item) => item.id !== row.id
        ),
      },
    }));
  };

  const currentBaselineDetails = selectedBaseline
    ? baselineDetails[selectedBaseline.baselineCode]
    : undefined;

  const handleDetailSubmit = async (data: Omit<BaselineData, "id">) => {
    if (!selectedBaseline || !currentBaselineDetails) return;

    const newData = editingDetail
      ? currentBaselineDetails.baselineData.map((item) =>
          item.date === editingDetail.date
            ? { ...data, id: editingDetail.id }
            : item
        )
      : [...currentBaselineDetails.baselineData, { ...data, id: Date.now() }];

    setBaselineDetails((prev) => ({
      ...prev,
      [selectedBaseline.baselineCode]: {
        ...currentBaselineDetails,
        baselineData: newData,
      },
    }));

    setDetailDialogOpen(false);
  };

  const availableXs = useMemo(() => {
    if (!selectedBaseline) return ["X1"];
    return ["X1", "X2", "X3", "X4", "X5"].filter(
      (x) =>
        selectedBaseline[x as keyof ENBData] !== "未使用" &&
        selectedBaseline[x as keyof ENBData] !== ""
    );
  }, [selectedBaseline]);

  return (
    <div className="container mx-auto py-6">
      {showListing ? (
        <BaselineListing
          items={items}
          title="能源基線"
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
          onItemClick={handleBaselineClick}
          addButtonText="新增基線"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowListing(true)}
              className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
            >
              返回列表
            </Button>
            <h2 className="text-xl font-semibold flex-1 text-center">
              {selectedBaseline?.baselineCode}
            </h2>
            <div className="w-[88px]"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-md h-[400px] flex flex-col">
              <div className="flex-1 overflow-auto">
                <DataGrid
                  data={currentBaselineDetails?.baselineData || []}
                  columns={columns}
                  title="能源基線管理"
                  onAdd={handleAddDetail}
                  onEdit={handleEditDetail}
                  onDelete={handleDeleteDetail}
                  initialState={{
                    pagination: {
                      pageSize: 5,
                      pageIndex: 0,
                    },
                    density: "compact",
                  }}
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md h-[400px] overflow-auto">
              <RegressionAnalysis
                data={
                  currentBaselineDetails?.regressionData || {
                    quadratic: { a: 0, b: 0, c: 0, y: "", rSquare: 0 },
                    linear: {
                      X1Label: "",
                      X2Label: "",
                      X3Label: "",
                      X1Coefficient: 0,
                      X2Coefficient: 0,
                      X3Coefficient: 0,
                      constant: 0,
                      equation: "",
                      rSquare: 0,
                      MBE: 0,
                      MBEPercentage: 0,
                      MAE: 0,
                      MAEPercentage: 0,
                      RMSE: 0,
                      CvRMSE: 0,
                      maxError: 0,
                    },
                  }
                }
              />
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <span>影響因素:</span>
              <Select value={selectedX} onValueChange={setSelectedX}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="選擇影響因素" />
                </SelectTrigger>
                <SelectContent>
                  {availableXs.map((x) => (
                    <SelectItem key={x} value={x}>
                      {`${x}: ${selectedBaseline?.[x as keyof ENBData]}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-[400px]">
              {currentBaselineDetails?.chartData[selectedX] && (
                <ReactECharts
                  style={{ height: "100%" }}
                  option={{
                    grid: {
                      top: 90,
                      right: 20,
                      bottom: 20,
                      left: 50,
                      containLabel: true,
                    },
                    tooltip: {
                      trigger: "axis",
                      axisPointer: {
                        type: "cross",
                      },
                    },
                    title: [
                      {
                        text: "最小平方法回歸",
                        top: 0,
                        left: "center",
                        textStyle: {
                          fontSize: 14,
                          fontWeight: "normal",
                        },
                      },
                      {
                        text: currentBaselineDetails.chartData[selectedX]
                          .Caption,
                        top: 25,
                        left: "center",
                        textStyle: {
                          fontSize: 13,
                          fontWeight: "normal",
                        },
                      },
                    ],
                    legend: {
                      data: ["實際值", "預測值"],
                      top: 50,
                      left: "center",
                      textStyle: {
                        fontSize: 12,
                      },
                    },
                    xAxis: {
                      type: "value",
                      name: "",
                      splitLine: {
                        lineStyle: {
                          type: "dashed",
                          opacity: 0.5,
                        },
                      },
                    },
                    yAxis: {
                      type: "value",
                      name: "監測值",
                      nameLocation: "middle",
                      nameGap: 35,
                      splitLine: {
                        lineStyle: {
                          type: "dashed",
                          opacity: 0.5,
                        },
                      },
                    },
                    series: [
                      {
                        type: "scatter",
                        name: "實際值",
                        data: currentBaselineDetails.chartData[
                          selectedX
                        ].Data.map(([x, y]) => [x, y]),
                        symbolSize: 8,
                      },
                      {
                        type: "line",
                        name: "預測值",
                        data: currentBaselineDetails.chartData[
                          selectedX
                        ].Data.map(([x, , z]) => [x, z]),
                        smooth: true,
                        showSymbol: false,
                        lineStyle: {
                          width: 2,
                        },
                      },
                    ],
                  }}
                />
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-[400px]">
              {currentBaselineDetails?.comparisonData && (
                <ReactECharts
                  style={{ height: "100%" }}
                  option={{
                    grid: {
                      top: 90,
                      right: 20,
                      bottom: 20,
                      left: 50,
                      containLabel: true,
                    },
                    tooltip: {
                      trigger: "axis",
                      axisPointer: {
                        type: "cross",
                      },
                    },
                    title: {
                      text: "基準線",
                      top: 0,
                      left: "center",
                      textStyle: {
                        fontSize: 14,
                        fontWeight: "normal",
                      },
                    },
                    legend: {
                      data: ["實際值", "理論值"],
                      top: 50,
                      left: "center",
                      textStyle: {
                        fontSize: 12,
                      },
                    },
                    xAxis: {
                      type: "category",
                      data: currentBaselineDetails.comparisonData.map(
                        (item) => item.date
                      ),
                      axisLabel: {
                        formatter: (value: string) => value.slice(5),
                      },
                      splitLine: {
                        lineStyle: {
                          type: "dashed",
                          opacity: 0.5,
                        },
                      },
                    },
                    yAxis: {
                      type: "value",
                      splitLine: {
                        lineStyle: {
                          type: "dashed",
                          opacity: 0.5,
                        },
                      },
                    },
                    series: [
                      {
                        name: "實際值",
                        type: "line",
                        data: currentBaselineDetails.comparisonData.map(
                          (item) => item.actualValue
                        ),

                        smooth: true,
                        lineStyle: {
                          width: 2,
                        },
                      },
                      {
                        name: "理論值",
                        type: "line",
                        data: currentBaselineDetails.comparisonData.map(
                          (item) => item.theoreticalValue
                        ),

                        smooth: true,
                        lineStyle: {
                          width: 2,
                        },
                      },
                    ],
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <BaselineDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        onSubmit={handleSubmit}
        initialData={getDialogData(dialogState.data)}
        mode={dialogState.mode}
      />

      <DetailDialog<BaselineData>
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onSubmit={handleDetailSubmit}
        initialData={editingDetail}
        mode={editingDetail ? "edit" : "create"}
        title="基線明細"
        description="基線明細"
        fields={getActiveDetailFields}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除基線</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除基線 &ldquo;{deleteConfirm?.baselineCode}&rdquo; 嗎？
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

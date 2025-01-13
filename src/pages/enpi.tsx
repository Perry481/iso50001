import React from "react";
import { useState, useEffect, useMemo } from "react";
import { ListingPage, BaseItem } from "@/components/ListingPage";
import { EnpiDialog, type EnpiFormData } from "@/components/dialogs/EnpiDialog";
import { DataGrid } from "@/components/DataGrid";
import { DetailDialog } from "@/components/dialogs/DetailDialog";
import { type MRT_ColumnDef } from "material-react-table";
import Tooltip from "@mui/material/Tooltip";
import ReactECharts from "echarts-for-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface IndicatorData {
  date: string;
  actualValue: number;
  theoreticalValue: number;
  maxDeviation: number;
  deviation: number;
  [key: string]: number | string | null;
}

interface Indicator {
  id: string;
  name: string;
  baselineCode: string;
  energyType: string;
  unit: string;
  startDate: string;
  frequency: "月" | "週";
  dataType: string;
  data: IndicatorData[];
}

interface DataPoint extends BaseItem {
  id: string;
  title: string;
  date: string;
  actualValue: number;
  theoreticalValue: number;
  maxDeviation: number;
  deviation: number;
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

export default function ENPI() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [showListingPage, setShowListingPage] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<Indicator | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<
    Indicator | undefined
  >();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingDataPoint, setEditingDataPoint] = useState<
    DataPoint | undefined
  >();
  const [deleteDataPointConfirm, setDeleteDataPointConfirm] =
    useState<DataPoint | null>(null);

  useEffect(() => {
    const loadIndicators = async () => {
      try {
        const response = await fetch("/api/enpi");
        const data = await response.json();
        setIndicators(data.indicators || []);
      } catch (error) {
        console.error("Failed to load indicators:", error);
      }
    };

    void loadIndicators();
  }, []);

  // Transform indicators to BaseItems for the ListingPage component
  const baseItems = indicators.map((indicator) => ({
    ...indicator,
    title: indicator.name,
  }));

  const handleIndicatorClick = (item: BaseItem) => {
    const indicator = indicators.find((i) => i.id === item.id);
    if (indicator) {
      setSelectedIndicator(indicator.id);
      setShowListingPage(false);
    }
  };

  const handleAddIndicator = () => {
    setEditingIndicator(undefined);
    setDialogOpen(true);
  };

  const handleEditIndicator = (item: BaseItem) => {
    const indicator = indicators.find((i) => i.id === item.id);
    if (indicator) {
      setEditingIndicator(indicator);
      setDialogOpen(true);
    }
  };

  const handleDeleteIndicator = (item: BaseItem) => {
    const indicator = indicators.find((i) => i.id === item.id);
    if (indicator) {
      setDeleteConfirm(indicator);
    }
  };

  const handleDeleteConfirmed = async (indicator: Indicator) => {
    try {
      await fetch(`/api/enpi?id=${encodeURIComponent(indicator.id)}`, {
        method: "DELETE",
      });

      const response = await fetch("/api/enpi");
      const data = await response.json();
      setIndicators(data.indicators);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete indicator:", error);
    }
  };

  const handleIndicatorSubmit = async (data: EnpiFormData) => {
    try {
      const response = await fetch("/api/enpi", {
        method: editingIndicator ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "indicator",
          data: {
            id: editingIndicator?.id,
            name: data.title,
            baselineCode: data.baselineCode,
            energyType: data.energyType,
            unit: data.unit,
            startDate: data.startDate,
            frequency: data.frequency,
            dataType: data.dataType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save indicator");
      }

      const refreshResponse = await fetch("/api/enpi");
      const refreshData = await refreshResponse.json();
      setIndicators(refreshData.indicators);

      setDialogOpen(false);
      setEditingIndicator(undefined);
    } catch (error) {
      console.error("Failed to save indicator:", error);
    }
  };

  const currentIndicator = indicators.find((i) => i.id === selectedIndicator);

  const renderIndicatorContent = (item: BaseItem) => {
    const indicator = item as unknown as Indicator;
    return (
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {indicator.name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              基準線代碼: {indicator.baselineCode}
            </p>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
              {indicator.frequency === "月" ? "月頻率" : "週頻率"}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>能源類型: {indicator.energyType}</p>
          <p>單位: {indicator.unit}</p>
          <p>數據類型: {indicator.dataType}</p>
          <p>開始日期: {indicator.startDate}</p>
        </div>
      </div>
    );
  };

  const columns = useMemo<MRT_ColumnDef<DataPoint>[]>(
    () => [
      {
        accessorKey: "date",
        header: "日期",
        size: 120,
        Header: () => (
          <Tooltip title="日期" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>日期</span>
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "actualValue",
        header: "實際值",
        size: 120,
        Header: () => (
          <Tooltip title="實際值" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>實際值</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "theoreticalValue",
        header: "理論值",
        size: 120,
        Header: () => (
          <Tooltip title="理論值" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>理論值</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "deviation",
        header: "偏差率 (%)",
        size: 120,
        Header: () => (
          <Tooltip title="偏差率 (%)" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>偏差率 (%)</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "maxDeviation",
        header: "最大偏差率 (%)",
        size: 120,
        Header: () => (
          <Tooltip title="最大偏差率 (%)" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>最大偏差率 (%)</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? value.toFixed(2) : "-";
        },
      },
    ],
    []
  );

  const handleAddDataPoint = () => {
    setEditingDataPoint(undefined);
    setDetailDialogOpen(true);
  };

  const handleEditDataPoint = (row: DataPoint) => {
    setEditingDataPoint(row);
    setDetailDialogOpen(true);
  };

  const handleDeleteDataPoint = (row: DataPoint) => {
    setDeleteDataPointConfirm(row);
  };

  const handleDataPointSubmit = async (data: Omit<DataPoint, "id">) => {
    try {
      const response = await fetch("/api/enpi", {
        method: editingDataPoint ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "dataPoint",
          indicatorId: currentIndicator?.id,
          data: {
            id: editingDataPoint?.id,
            ...data,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save data point");
      }

      const refreshResponse = await fetch("/api/enpi");
      const refreshData = await refreshResponse.json();
      setIndicators(refreshData.indicators);

      setDetailDialogOpen(false);
      setEditingDataPoint(undefined);
    } catch (error) {
      console.error("Failed to save data point:", error);
    }
  };

  const handleDeleteDataPointConfirmed = async (dataPoint: DataPoint) => {
    try {
      await fetch(
        `/api/enpi?type=dataPoint&id=${encodeURIComponent(dataPoint.id)}`,
        {
          method: "DELETE",
        }
      );

      const response = await fetch("/api/enpi");
      const data = await response.json();
      setIndicators(data.indicators);
      setDeleteDataPointConfirm(null);
    } catch (error) {
      console.error("Failed to delete data point:", error);
    }
  };

  // Transform indicator data to include required BaseItem properties
  const dataPoints: DataPoint[] =
    currentIndicator?.data.map((item, index) => ({
      id: `${currentIndicator.id}_${index}`,
      title: `${item.date}`,
      ...item,
    })) || [];

  const chartOption = useMemo(() => {
    if (!currentIndicator) return {};

    const dates = currentIndicator.data.map((item) => item.date);
    const actualValues = currentIndicator.data.map((item) => item.actualValue);
    const theoreticalValues = currentIndicator.data.map(
      (item) => item.theoreticalValue
    );

    return {
      title: {
        text: "基準線",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      legend: {
        data: ["實際值", "理論值"],
        top: 30,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "實際值",
          type: "line",
          data: actualValues,
          symbol: "circle",
          symbolSize: 6,
          smooth: true,
        },
        {
          name: "理論值",
          type: "line",
          data: theoreticalValues,
          symbol: "circle",
          symbolSize: 6,
          smooth: true,
        },
      ],
    };
  }, [currentIndicator]);

  return (
    <div className="p-4 space-y-4">
      {showListingPage ? (
        <ListingPage
          title="能源績效指標列表"
          items={baseItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemClick={handleIndicatorClick}
          onAddItem={handleAddIndicator}
          onEditItem={handleEditIndicator}
          onDeleteItem={handleDeleteIndicator}
          addButtonText="新增指標"
          renderItemContent={renderIndicatorContent}
        />
      ) : (
        <>
          <DataGrid
            title={currentIndicator?.name}
            data={dataPoints}
            columns={columns}
            onAdd={handleAddDataPoint}
            onEdit={handleEditDataPoint}
            onDelete={handleDeleteDataPoint}
            onBack={() => setShowListingPage(true)}
          />
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ReactECharts option={chartOption} style={{ height: "400px" }} />
          </div>
        </>
      )}

      <EnpiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleIndicatorSubmit}
        initialData={
          editingIndicator
            ? {
                title: editingIndicator.name,
                baselineCode: editingIndicator.baselineCode,
                energyType: editingIndicator.energyType,
                unit: editingIndicator.unit,
                startDate: editingIndicator.startDate,
                frequency: editingIndicator.frequency,
                dataType: editingIndicator.dataType,
              }
            : undefined
        }
        mode={editingIndicator ? "edit" : "create"}
      />

      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onSubmit={handleDataPointSubmit}
        initialData={editingDataPoint}
        mode={editingDataPoint ? "edit" : "create"}
        title="數據"
        description="數據"
        fields={[
          {
            key: "date",
            label: "日期",
            type: "date",
            required: true,
          },
          {
            key: "actualValue",
            label: "實際值",
            type: "number",
            required: true,
          },
          {
            key: "theoreticalValue",
            label: "理論值",
            type: "number",
            required: true,
          },
          {
            key: "deviation",
            label: "偏差率 (%)",
            type: "number",
            required: true,
          },
          {
            key: "maxDeviation",
            label: "最大偏差率 (%)",
            type: "number",
            required: true,
          },
        ]}
      />

      {/* Indicator Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除指標</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除指標 &ldquo;{deleteConfirm?.name}&rdquo; 嗎？
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

      {/* Data Point Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDataPointConfirm}
        onOpenChange={() => setDeleteDataPointConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除數據</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除此數據嗎？
            <br />
            此操作無法復原。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDataPointConfirm(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDataPointConfirm &&
                handleDeleteDataPointConfirmed(deleteDataPointConfirm)
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

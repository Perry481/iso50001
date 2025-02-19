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
import { getECFs } from "@/lib/energy-ecf/service";
import type { ECF } from "@/lib/energy-ecf/types";
import { getBaselineList } from "@/lib/energy-enb/service";
import { useCompany } from "../contexts/CompanyContext";

interface IndicatorData {
  date: string;
  actualValue: number;
  theoreticalValue: number;
  maxDeviation: number;
  deviation: number;
  remark: string | null;
  [key: string]: number | string | null;
}

interface Indicator {
  id: string;
  name: string;
  baselineName: string;
  energyType: {
    id: string;
    name: string;
    unit: string;
  };
  unit: string;
  startDate: string;
  frequency: "月" | "週" | "日" | "季";
  dataType: string;
  data: IndicatorData[];
  remark: string | null;
}

interface DataPoint extends BaseItem {
  id: string;
  title: string;
  date: string;
  actualValue: number;
  X1: number | null;
  X2: number | null;
  X3: number | null;
  X4: number | null;
  X5: number | null;
  theoreticalValue: number;
  maxDeviation: number;
  deviation: number;
  remark: string | null;
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
  const [baselineList, setBaselineList] = useState<Record<string, string>>({});
  const { companyName, isSchemaInitialized } = useCompany();

  useEffect(() => {
    const loadData = async () => {
      if (!isSchemaInitialized) return;

      try {
        const [indicatorsResponse, ecfsData, baselineListData] =
          await Promise.all([
            fetch(`/api/enpi?company=${companyName}`),
            getECFs(companyName),
            getBaselineList(companyName),
          ]);

        const indicatorsData = await indicatorsResponse.json();
        setBaselineList(baselineListData);

        if (indicatorsData.indicators) {
          // Map ECF data to indicators
          const mappedIndicators = indicatorsData.indicators.map(
            (
              indicator: Omit<Indicator, "energyType"> & {
                energyType: {
                  id: string;
                  name: string;
                  unit: string;
                };
              }
            ) => ({
              ...indicator,
              energyType: {
                id: indicator.energyType.id,
                name:
                  ecfsData.find(
                    (ecf: ECF) => ecf.code === indicator.energyType.id
                  )?.name || "(未設定)",
                unit:
                  ecfsData.find(
                    (ecf: ECF) => ecf.code === indicator.energyType.id
                  )?.unit || indicator.energyType.unit,
              },
            })
          );

          setIndicators(mappedIndicators);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    void loadData();
  }, [companyName, isSchemaInitialized]);

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
      console.log("Editing indicator:", indicator);
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
      console.log("Deleting indicator:", indicator);
      const response = await fetch(
        `/api/enpi?company=${companyName}&id=${indicator.id}`,
        {
          method: "DELETE",
        }
      );

      console.log("Delete response status:", response.status);
      const result = await response.json();
      console.log("Delete response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete indicator");
      }

      setIndicators(result.indicators);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete indicator:", error);
      // TODO: Show error message to user
    }
  };

  const handleIndicatorSubmit = async (data: EnpiFormData) => {
    try {
      const requestData = {
        name: data.title,
        baselineName: data.baselineName,
        ebSgt: data.ebSgt,
        energyType: data.energyType,
        unit: data.unit,
        startDate: data.startDate,
        frequency: data.frequency,
        dataType: data.dataType,
        remark: data.remark,
      };

      if (editingIndicator) {
        console.log("Updating indicator with data:", {
          ...requestData,
          id: editingIndicator.id,
          currentBaselineName: editingIndicator.baselineName,
          newBaselineName: data.baselineName,
          ebSgt: data.ebSgt,
        });
        const response = await fetch(`/api/enpi?company=${companyName}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...requestData, id: editingIndicator.id }),
        });

        console.log("Edit response status:", response.status);
        const result = await response.json();
        console.log("Edit response data:", result);

        if (!response.ok) {
          throw new Error(result.message || "Failed to update indicator");
        }

        setIndicators(result.indicators);
        setDialogOpen(false);
        setEditingIndicator(undefined);
        return;
      }

      console.log("Creating new indicator:", requestData);
      const response = await fetch(`/api/enpi?company=${companyName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to create indicator");
      }

      setIndicators(result.indicators);
      setDialogOpen(false);
      setEditingIndicator(undefined);
    } catch (error) {
      console.error("Failed to save indicator:", error);
      // TODO: Show error message to user
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
              基準線名稱: {indicator.baselineName}
            </p>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
              {indicator.frequency}頻率
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
          <p>能源類型: {indicator.energyType.name}</p>
          <p>單位: {indicator.unit}</p>
          <p>數據類型: {indicator.dataType}</p>
          <p>開始日期: {indicator.startDate}</p>
          <p className="col-span-2">備註: {indicator.remark || "(無)"}</p>
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
        accessorKey: "X1",
        header: "X1",
        size: 120,
        Header: () => (
          <Tooltip title="X1" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>X1</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "X2",
        header: "X2",
        size: 120,
        Header: () => (
          <Tooltip title="X2" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>X2</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "X3",
        header: "X3",
        size: 120,
        Header: () => (
          <Tooltip title="X3" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>X3</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "X4",
        header: "X4",
        size: 120,
        Header: () => (
          <Tooltip title="X4" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>X4</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
          return value ? value.toFixed(2) : "-";
        },
      },
      {
        accessorKey: "X5",
        header: "X5",
        size: 120,
        Header: () => (
          <Tooltip title="X5" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>X5</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
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
      {
        accessorKey: "remark",
        header: "備註",
        size: 200,
        Header: () => (
          <Tooltip title="備註" {...tooltipProps}>
            <div className="Mui-TableHeadCell-Content-Wrapper MuiBox-root css-lapokc">
              <span>備註</span>
            </div>
          </Tooltip>
        ),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value || "-";
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

  const handleDeleteDataPointConfirmed = async (dataPoint: DataPoint) => {
    try {
      if (!currentIndicator) return;

      // Create form data for deletion
      const formData = new URLSearchParams();
      formData.append("oper", "del");
      formData.append("schema", companyName);
      formData.append("EnPiID", currentIndicator.id);
      formData.append("StartDate", dataPoint.date);

      console.log("Delete form data:", formData.toString());

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyPerformanceDetail.ashx?schema=${companyName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      console.log("Delete response status:", response.status);
      const responseText = await response.text();
      console.log("Delete response text:", responseText);

      if (!response.ok) {
        throw new Error(`Failed to delete data point: ${responseText}`);
      }

      // Fetch updated data
      const updatedResponse = await fetch(`/api/enpi?company=${companyName}`);
      const result = await updatedResponse.json();

      if (result.indicators) {
        setIndicators(result.indicators);
      }

      setDeleteDataPointConfirm(null);
    } catch (error) {
      console.error("Failed to delete data point:", error);
      // TODO: Show error message to user
    }
  };

  const handleDataPointSubmit = async (data: Omit<DataPoint, "id">) => {
    try {
      if (!currentIndicator) return;

      // Create form data for the POST request
      const formData = new URLSearchParams();
      formData.append("oper", editingDataPoint ? "edit" : "add");
      formData.append("schema", companyName);
      formData.append("EnPiID", currentIndicator.id);

      if (editingDataPoint) {
        // For edit, we need to send both the original date (as id) and the new date (if changed)
        formData.append("id", editingDataPoint.date); // Original date as identifier
        formData.append("StartDate", data.date); // New date (can be same as original)
      } else {
        formData.append("StartDate", data.date);
      }

      formData.append("Value", data.actualValue.toString());
      formData.append("X1", data.X1?.toString() || "");
      formData.append("X2", data.X2?.toString() || "");
      formData.append("X3", data.X3?.toString() || "");
      formData.append("X4", data.X4?.toString() || "");
      formData.append("X5", data.X5?.toString() || "");
      formData.append("Remark", data.remark || "");

      console.log(
        "Form data for",
        editingDataPoint ? "edit" : "add",
        ":",
        formData.toString()
      );

      const response = await fetch(
        `https://esg.jtmes.net/OptonSetup/GetEnergyPerformanceDetail.ashx?schema=${companyName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to ${
            editingDataPoint ? "update" : "add"
          } data point: ${responseText}`
        );
      }

      // After successful edit/add, fetch the updated theoretical values
      const estimateUrl = `https://esg.jtmes.net/OptonSetup/GetEnergyPerformanceDetail.ashx?selecttype=estimatestatic&EnPiID=${currentIndicator.id}&Feature=X1&schema=${companyName}`;

      console.log("Fetching updated theoretical values from:", estimateUrl);

      const estimateResponse = await fetch(estimateUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Estimate response status:", estimateResponse.status);
      const estimateText = await estimateResponse.text();
      console.log("Estimate response:", estimateText);

      // Fetch updated data to refresh the UI
      const updatedResponse = await fetch(`/api/enpi?company=${companyName}`);
      const result = await updatedResponse.json();

      if (result.indicators) {
        setIndicators(result.indicators);
      }

      setDetailDialogOpen(false);
      setEditingDataPoint(undefined);
    } catch (error) {
      console.error("Failed to save data point:", error);
      // TODO: Show error message to user
    }
  };

  const handleDateValidation = (date: string) => {
    if (!currentIndicator) return false;

    const existingDates = currentIndicator.data.map((item) => item.date);
    return existingDates.some((existingDate) => {
      // If editing, exclude the current record from duplicate check
      if (editingDataPoint?.date === existingDate) return false;
      return existingDate === date;
    });
  };

  // Transform indicator data to include required BaseItem properties
  const dataPoints: DataPoint[] =
    currentIndicator?.data.map((item, index) => ({
      id: `${currentIndicator.id}_${index}`,
      title: `${item.date}`,
      date: item.date,
      actualValue: item.actualValue,
      X1: typeof item.X1 === "number" ? item.X1 : null,
      X2: typeof item.X2 === "number" ? item.X2 : null,
      X3: typeof item.X3 === "number" ? item.X3 : null,
      X4: typeof item.X4 === "number" ? item.X4 : null,
      X5: typeof item.X5 === "number" ? item.X5 : null,
      theoreticalValue: item.theoreticalValue,
      maxDeviation: item.maxDeviation,
      deviation: item.deviation,
      remark: item.remark,
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
                baselineName: editingIndicator.baselineName,
                ebSgt:
                  Object.entries(baselineList).find(
                    ([, name]) => name === editingIndicator.baselineName
                  )?.[0] || "",
                energyType: editingIndicator.energyType,
                unit: editingIndicator.unit,
                startDate: editingIndicator.startDate,
                frequency: editingIndicator.frequency,
                dataType: editingIndicator.dataType,
                remark: editingIndicator.data?.[0]?.remark || null,
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
        onDateValidation={handleDateValidation}
        fields={[
          ...(editingDataPoint
            ? []
            : [
                {
                  key: "date",
                  label: "日期",
                  type: "date" as const,
                  required: true,
                },
              ]),
          {
            key: "actualValue",
            label: "實際值",
            type: "number" as const,
            required: true,
          },
          {
            key: "X1",
            label: "X1",
            type: "number" as const,
            required: false,
          },
          {
            key: "X2",
            label: "X2",
            type: "number" as const,
            required: false,
          },
          {
            key: "X3",
            label: "X3",
            type: "number" as const,
            required: false,
          },
          {
            key: "X4",
            label: "X4",
            type: "number" as const,
            required: false,
          },
          {
            key: "X5",
            label: "X5",
            type: "number" as const,
            required: false,
          },
          {
            key: "remark",
            label: "備註",
            type: "text" as const,
            required: false,
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

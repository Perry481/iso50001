import React from "react";
import { useState, useEffect, useCallback } from "react";
import { ListingPage } from "@/components/ListingPage";
import { ReportDialog, type Report } from "@/components/dialogs/ReportDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactECharts from "echarts-for-react";
import { StateGrid } from "@/components/StateGrid";
import { useCompany } from "../contexts/CompanyContext";
import { getApiUrl } from "@/lib/utils/api";

type FilterType = "共用設備群組" | "工作場域管理" | "能源類別";

interface EnergyData {
  EnergyTypeID: string;
  name: string;
  value: number;
}

interface SEUEquipmentData {
  EceSgt: number;
  EquipmentName: string;
  IsSEU: boolean;
  KW: number;
}

interface MonthlyData {
  date: string;
  [key: string]: string | number;
}

interface SEUStateData {
  equipmentName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
  EceSgt?: number;
  groupId?: string;
}

interface SEUGroupData {
  groupName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
  groupId?: string;
}

interface TooltipParam {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number;
}

const BASE_URL = "https://esg.jtmes.net/OptonSetup";

export default function SEU() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showReportList, setShowReportList] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | undefined>();
  const [deleteReportConfirm, setDeleteReportConfirm] = useState<Report | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>("共用設備群組");
  const [energyConsumption, setEnergyConsumption] = useState<EnergyData[]>([]);
  const [energyEmission, setEnergyEmission] = useState<EnergyData[]>([]);
  const [equipmentConsumption, setEquipmentConsumption] = useState<
    EnergyData[]
  >([]);
  const [seuEquipmentData, setSeuEquipmentData] = useState<SEUEquipmentData[]>(
    []
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [seuStateData, setSeuStateData] = useState<SEUStateData[]>([]);
  const [seuGroupData, setSEUGroupData] = useState<SEUGroupData[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { companyName, isSchemaInitialized } = useCompany();

  // Add refs for chart instances
  const equipmentChartRef = React.useRef<ReactECharts>(null);
  const monthlyChartRef = React.useRef<ReactECharts>(null);

  useEffect(() => {
    const loadReports = async () => {
      if (!isSchemaInitialized) return;

      try {
        const response = await fetch(getApiUrl(`seu?company=${companyName}`));
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error("Failed to load reports:", error);
      }
    };

    void loadReports();
  }, [companyName, isSchemaInitialized]);

  // Map filter type to category type
  const getCategoryType = (filter: FilterType): string => {
    switch (filter) {
      case "共用設備群組":
        return "C";
      case "工作場域管理":
        return "A";
      case "能源類別":
        return "E";
      default:
        return "C";
    }
  };

  const loadEnergyData = useCallback(
    async (eeSgt: number, categoryType: string) => {
      try {
        const response = await fetch(
          getApiUrl(
            `seu?type=energy&eeSgt=${eeSgt}&categoryType=${categoryType}&company=${companyName}`
          )
        );
        const data = await response.json();
        setEnergyConsumption(data.energyConsumption || []);
        setEnergyEmission(data.energyEmission || []);
        setEquipmentConsumption(data.equipmentConsumption || []);
        setSeuEquipmentData(data.seuEquipmentData || []);
        setMonthlyData(data.monthlyData || []);
        setSeuStateData(data.seuStateData || []);
        setSEUGroupData(data.seuGroupData || []);
      } catch (error) {
        console.error("Error loading energy data:", error);
      }
    },
    [companyName]
  );

  useEffect(() => {
    if (!showReportList && selectedReport?.eeSgt && isSchemaInitialized) {
      void loadEnergyData(selectedReport.eeSgt, getCategoryType(filterType));
    }
  }, [
    showReportList,
    selectedReport,
    loadEnergyData,
    filterType,
    isSchemaInitialized,
  ]);

  const handleAddReport = () => {
    setEditingReport(undefined);
    setReportDialogOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setReportDialogOpen(true);
  };

  const handleDeleteReport = (report: Report) => {
    setDeleteReportConfirm(report);
  };

  const handleReportClick = async (report: Report) => {
    setSelectedReport(report);
    setShowReportList(false);
  };

  const handleReportSubmit = async (data: Report) => {
    try {
      const method = editingReport ? "PUT" : "POST";
      const response = await fetch(getApiUrl(`seu?company=${companyName}`), {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save report");
      }

      const result = await response.json();
      setReports(result.reports);
      setReportDialogOpen(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  const handleDeleteReportConfirmed = async (report: Report) => {
    try {
      const response = await fetch(
        getApiUrl(`seu?company=${companyName}&eeSgt=${report.eeSgt}`),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      const result = await response.json();
      setReports(result.reports);
      setDeleteReportConfirm(null);

      // Update current page if needed
      const totalPages = Math.max(1, Math.ceil(result.reports.length / 4));
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const renderReportContent = (report: Report) => (
    <>
      <h3 className="font-semibold text-lg text-gray-900">{report.title}</h3>
      <p className="text-gray-500 text-sm">
        {report.startDate} - {report.endDate}
      </p>
      <p className="text-gray-500 text-sm">審查人員: {report.reviewerId}</p>
    </>
  );

  const consumptionChartOption = {
    title: {
      text: "用電當量(kWh)",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: function (params: {
        name: string;
        marker: string;
        value: number;
        percent: number;
      }) {
        return `<div style="font-weight: bold">${params.name}</div>${params.marker}${params.value} (${params.percent}%)`;
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "用電當量",
        type: "pie",
        radius: "50%",
        data: energyConsumption.map((item: EnergyData) => ({
          name: item.name,
          value: item.value,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const percentageChartOption = {
    title: {
      text: "排放當量(tCO2e)",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: function (params: {
        name: string;
        marker: string;
        value: number;
        percent: number;
      }) {
        return `<div style="font-weight: bold">${params.name}</div>${params.marker}${params.value}%`;
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "排放當量",
        type: "pie",
        radius: "50%",
        data: energyEmission.map((item: EnergyData) => ({
          name: item.name,
          value: item.value,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const getChartTitle = (filter: FilterType): string => {
    switch (filter) {
      case "共用設備群組":
        return "共用設備群組用電當量(kWh)";
      case "工作場域管理":
        return "工作場域用電當量(kWh)";
      case "能源類別":
        return "能源類別用電當量(kWh)";
      default:
        return "用電當量(kWh)";
    }
  };

  const equipmentChartOption = {
    title: {
      text: getChartTitle(filterType),
      left: "center",
    },
    legend: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (
        params: {
          name: string;
          marker: string;
          value: number;
          seriesName: string;
        }[]
      ) {
        const value = params[0].value;
        return `<div style="font-weight: bold">${params[0].name}</div>${
          params[0].marker
        }用電當量(kWh): ${value.toLocaleString()} kW`;
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 20,
      },
      {
        type: "inside",
        xAxisIndex: [0],
        start: 0,
        end: 100,
      },
    ],
    xAxis: {
      type: "category",
      data: [...equipmentConsumption]
        .sort((a, b) => b.value - a.value)
        .map((item) => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      name: "能耗 (kW)",
      axisLabel: {
        formatter: (value: number) => value.toLocaleString(),
      },
    },
    series: [
      {
        type: "bar",
        data: [...equipmentConsumption]
          .sort((a, b) => b.value - a.value)
          .map((item) => item.value),
        itemStyle: {
          color: "#6B7ED9",
        },
      },
    ],
  };

  const paretoChartOption = {
    title: {
      text: "設備能耗帕累托圖",
      left: "center",
    },
    legend: {
      top: 25,
      data: ["SEU設備", "一般設備", "累計百分比"],
      textStyle: {
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (
        params: {
          name: string;
          marker: string;
          value: number;
          seriesName: string;
          color: string;
        }[]
      ) {
        const lineData = params.find(
          (param) => param.seriesName === "累計百分比"
        );
        const seuValue =
          params.find((param) => param.seriesName === "SEU設備")?.value || 0;
        const nonSeuValue =
          params.find((param) => param.seriesName === "一般設備")?.value || 0;
        const totalValue = seuValue + nonSeuValue;
        const isSeu = seuValue > 0;
        const barColor = isSeu ? "#91CC75" : "#6B7ED9";

        let result = `<div style="font-weight: bold">${params[0].name} (${
          isSeu ? "已" : "未"
        }列入SEU)</div>`;
        result += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${barColor};"></span>用電當量(kWh): ${totalValue.toLocaleString()} kW`;
        if (lineData) {
          result += `<br/>${
            lineData.marker
          }累計百分比: ${lineData.value.toFixed(2)}%`;
        }
        return result;
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 50,
      },
      {
        type: "inside",
        xAxisIndex: [0],
        start: 0,
        end: 50,
      },
    ],
    xAxis: {
      type: "category",
      data: seuEquipmentData.map((item) => item.EquipmentName),
      axisLabel: {
        interval: "auto",
        rotate: 0,
        overflow: "break",
      },
    },
    yAxis: [
      {
        type: "value",
        name: "能耗 (kW)",
      },
      {
        type: "value",
        name: "累計百分比",
        max: 100,
        axisLabel: {
          formatter: "{value}%",
        },
      },
    ],
    series: [
      {
        name: "SEU設備",
        type: "bar",
        stack: "total",
        data: seuEquipmentData.map((item) => (item.IsSEU ? item.KW : 0)),
        itemStyle: {
          color: "#91CC75",
        },
      },
      {
        name: "一般設備",
        type: "bar",
        stack: "total",
        data: seuEquipmentData.map((item) => (!item.IsSEU ? item.KW : 0)),
        itemStyle: {
          color: "#6B7ED9",
        },
      },
      {
        name: "累計百分比",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: (() => {
          const total = seuEquipmentData.reduce(
            (sum, item) => sum + item.KW,
            0
          );
          let cumSum = 0;
          return seuEquipmentData.map((item) => {
            cumSum += item.KW;
            return Number(((cumSum / total) * 100).toFixed(2));
          });
        })(),
        symbolSize: 8,
        lineStyle: {
          color: "#FFD700",
        },
        itemStyle: {
          color: "#FFD700",
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: "#E88080",
            type: "dashed",
            width: 2,
          },
          data: [
            {
              yAxis: 80,
              label: {
                show: false,
              },
            },
          ],
        },
      },
    ],
  };

  const monthlyChartOption = {
    title: {
      text: "月份用電當量(kWh)",
      left: "center",
      top: 0,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params: TooltipParam[]) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param) => {
          result += `${param.marker}${
            param.seriesName
          }: ${param.value.toLocaleString()}<br/>`;
        });
        return result;
      },
    },
    legend: {
      type: "scroll",
      data:
        monthlyData.length > 0
          ? Object.keys(monthlyData[0]).filter((key) => key !== "date")
          : [],
      top: 25,
      textStyle: {
        fontSize: 12,
      },
      pageButtonItemGap: 5,
      pageButtonGap: 5,
      pageButtonPosition: "end",
      pageFormatter: "{current}/{total}",
      pageIconColor: "#6B7ED9",
      pageIconInactiveColor: "#aaa",
      pageIconSize: 15,
      pageTextStyle: {
        color: "#6B7ED9",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "20%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: monthlyData.map((item) => item.date),
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      name: "kWh",
      axisLabel: {
        formatter: (value: number) => value.toLocaleString(),
      },
    },
    series:
      monthlyData.length > 0
        ? Object.keys(monthlyData[0])
            .filter((key) => key !== "date")
            .map((key) => ({
              name: key,
              type: "line",
              data: monthlyData.map((item) => {
                const value = item[key];
                return typeof value === "number" ? value : 0;
              }),
              symbol: "circle",
              symbolSize: 8,
              smooth: true,
              lineStyle: {
                width: 2,
              },
              emphasis: {
                focus: "series",
              },
            }))
        : [],
  };

  const handleStateChange = useCallback(
    async (row: SEUStateData) => {
      try {
        if (!row.EceSgt) {
          return;
        }

        const selecttype = !row.IsSEU ? "isseu" : "removeseu";
        const response = await fetch(
          `${BASE_URL}/GetEnergyMachineList.ashx?selecttype=${selecttype}&EceSgt=${row.EceSgt}&schema=${companyName}`
        );

        if (!response.ok) {
          throw new Error("Failed to update SEU status");
        }

        setSeuStateData((prev) =>
          prev.map((item) =>
            item.EceSgt === row.EceSgt
              ? {
                  ...item,
                  IsSEU: !item.IsSEU,
                  status: !item.IsSEU ? undefined : "取消",
                }
              : item
          )
        );

        if (selectedReport?.eeSgt) {
          void loadEnergyData(
            selectedReport.eeSgt,
            getCategoryType(filterType)
          );
        }
      } catch (error) {
        console.error("Failed to update equipment SEU status:", error);
      }
    },
    [companyName, selectedReport?.eeSgt, filterType, loadEnergyData]
  );

  const handleGroupStateChange = useCallback(
    async (row: SEUStateData) => {
      try {
        if (!row.groupId) {
          return;
        }

        const selecttype = !row.IsSEU ? "isseu" : "removeseu";
        const response = await fetch(
          `${BASE_URL}/GetEnergyGroupList.ashx?selecttype=${selecttype}&EnergyGroupID=${row.groupId}&schema=${companyName}`
        );

        if (!response.ok) {
          throw new Error("Failed to update group SEU status");
        }

        setSEUGroupData((prev) =>
          prev.map((item) =>
            item.groupId === row.groupId
              ? {
                  ...item,
                  IsSEU: !item.IsSEU,
                  status: !item.IsSEU ? undefined : "取消",
                }
              : item
          )
        );

        if (selectedReport?.eeSgt) {
          void loadEnergyData(
            selectedReport.eeSgt,
            getCategoryType(filterType)
          );
        }
      } catch (error) {
        console.error("Failed to update group SEU status:", error);
      }
    },
    [companyName, selectedReport?.eeSgt, filterType, loadEnergyData]
  );

  // Clear chart data and reload when filter type changes
  const handleFilterTypeChange = (value: FilterType) => {
    setFilterType(value);
    // Dispose chart instances
    if (equipmentChartRef.current?.getEchartsInstance()) {
      equipmentChartRef.current.getEchartsInstance().dispose();
    }
    if (monthlyChartRef.current?.getEchartsInstance()) {
      monthlyChartRef.current.getEchartsInstance().dispose();
    }
    // Clear all chart data
    setMonthlyData([]);
    setEnergyConsumption([]);
    setEnergyEmission([]);
    setEquipmentConsumption([]);
    setSeuEquipmentData([]);
    setSeuStateData([]);
    setSEUGroupData([]);
    // Load new data with the selected category type
    if (selectedReport?.eeSgt) {
      void loadEnergyData(selectedReport.eeSgt, getCategoryType(value));
    }
  };

  return (
    <div className="p-2 space-y-2">
      {showReportList ? (
        <ListingPage
          title="SEU報告列表"
          items={reports}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemClick={handleReportClick}
          onAddItem={handleAddReport}
          onEditItem={handleEditReport}
          onDeleteItem={handleDeleteReport}
          addButtonText="新增報告"
          renderItemContent={renderReportContent}
          noAdd={true}
          noEdit={true}
          noDelete={true}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => setShowReportList(true)}
              className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
            >
              返回列表
            </Button>
            <div className="ml-auto">
              <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="選擇分類方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="共用設備群組">共用設備群組</SelectItem>
                  <SelectItem value="工作場域管理">工作場域管理</SelectItem>
                  <SelectItem value="能源類別">能源類別</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <ReactECharts option={consumptionChartOption} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <ReactECharts option={percentageChartOption} />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <ReactECharts
                ref={equipmentChartRef}
                option={equipmentChartOption}
                style={{ height: "400px" }}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <ReactECharts
                ref={monthlyChartRef}
                option={monthlyChartOption}
                style={{ height: "400px" }}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <ReactECharts
                option={paretoChartOption}
                style={{ height: "400px" }}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-2 gap-6">
                <StateGrid
                  data={seuStateData.map((item) => ({
                    equipmentName: item.equipmentName,
                    KW: item.KW,
                    percentage: item.percentage,
                    IsSEU: item.IsSEU,
                    status: item.status,
                    EceSgt: item.EceSgt,
                  }))}
                  title="設備能耗狀態"
                  onStateChange={handleStateChange}
                />
                <StateGrid
                  data={seuGroupData.map((item) => ({
                    equipmentName: item.groupName,
                    KW: item.KW,
                    percentage: item.percentage,
                    IsSEU: item.IsSEU,
                    status: item.status,
                    groupId: item.groupId,
                  }))}
                  title="群組能耗狀態"
                  nameHeader="群組名稱"
                  onStateChange={handleGroupStateChange}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleReportSubmit}
        initialData={editingReport}
        mode={editingReport ? "edit" : "create"}
      />

      {/* Report Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteReportConfirm}
        onOpenChange={() => setDeleteReportConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除報告</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center">
            您確定要刪除報告 &ldquo;{deleteReportConfirm?.title}&rdquo; 嗎？
            <br />
            此操作無法復原。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteReportConfirm(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteReportConfirm &&
                handleDeleteReportConfirmed(deleteReportConfirm)
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

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
  total: number;
  undefined: number;
  officialVehicles: number;
  autoPressMachine: number;
}

interface SEUStateData {
  equipmentName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
}

interface SEUGroupData {
  groupName: string;
  KW: number;
  percentage: number;
  IsSEU: boolean;
  status?: string;
}

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

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("/api/seu");
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error("Failed to load reports:", error);
      }
    };

    void loadReports();
  }, []);

  const loadEnergyData = useCallback(async () => {
    try {
      const response = await fetch("/api/seu?type=energy");
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
  }, []);

  useEffect(() => {
    if (!showReportList) {
      void loadEnergyData();
    }
  }, [showReportList, loadEnergyData]);

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

  const handleReportClick = async () => {
    setShowReportList(false);
  };

  const handleReportSubmit = async (data: Report) => {
    try {
      const response = await fetch("/api/seu", {
        method: editingReport ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report",
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save report");
      }

      const refreshResponse = await fetch("/api/seu");
      const refreshData = await refreshResponse.json();
      setReports(refreshData.reports);

      setReportDialogOpen(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  const handleDeleteReportConfirmed = async (report: Report) => {
    try {
      await fetch(`/api/seu?title=${encodeURIComponent(report.title)}`, {
        method: "DELETE",
      });

      const response = await fetch("/api/seu");
      const data = await response.json();
      setReports(data.reports);
      setDeleteReportConfirm(null);
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

  const equipmentChartOption = {
    title: {
      text: "場域群組用電當量(kWh)",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (
        params: { name: string; marker: string; value: number }[]
      ) {
        const param = params[0];
        return `<div style="font-weight: bold">${param.name}</div>${param.marker}${param.value}`;
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: equipmentConsumption.map((item) => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        data: equipmentConsumption.map((item) => item.value),
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
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (
        params: { name: string; marker: string; value: number }[]
      ) {
        const barData = params[0];
        const lineData = params[1];
        return `<div style="font-weight: bold">${barData.name}</div>${
          barData.marker
        }${barData.value.toFixed(2)} kW<br/>${
          lineData.marker
        }${lineData.value.toFixed(2)}%`;
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
        name: "能耗",
        type: "bar",
        data: seuEquipmentData.map((item) => item.KW),
        itemStyle: {
          color: function (params: { dataIndex: number }) {
            return seuEquipmentData[params.dataIndex].IsSEU
              ? "#6B7ED9"
              : "#91CC75";
          },
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
    },
    legend: {
      data: ["全部", "未設定", "公務車(汽、柴油)", "自動壓蓋機"],
      top: 25,
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "15%",
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
    },
    series: [
      {
        name: "全部",
        type: "line",
        data: monthlyData.map((item) => item.total),
        symbol: "circle",
        symbolSize: 8,
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: "未設定",
        type: "line",
        data: monthlyData.map((item) => item.undefined),
        symbol: "circle",
        symbolSize: 8,
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: "公務車(汽、柴油)",
        type: "line",
        data: monthlyData.map((item) => item.officialVehicles),
        symbol: "circle",
        symbolSize: 8,
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: "自動壓蓋機",
        type: "line",
        data: monthlyData.map((item) => item.autoPressMachine),
        symbol: "circle",
        symbolSize: 8,
        smooth: true,
        lineStyle: {
          width: 2,
        },
      },
    ],
  };

  const handleStateChange = useCallback((row: SEUStateData) => {
    setSeuStateData((prev) =>
      prev.map((item) =>
        item.equipmentName === row.equipmentName
          ? { ...item, status: item.status === "取消" ? undefined : "取消" }
          : item
      )
    );
  }, []);

  const handleGroupStateChange = useCallback((row: SEUStateData) => {
    setSEUGroupData((prev) =>
      prev.map((item) =>
        item.groupName === row.equipmentName
          ? { ...item, status: item.status === "取消" ? undefined : "取消" }
          : item
      )
    );
  }, []);

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
              <Select
                value={filterType}
                onValueChange={(value: FilterType) => setFilterType(value)}
              >
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
                option={equipmentChartOption}
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
              <ReactECharts
                option={monthlyChartOption}
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

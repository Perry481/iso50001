import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { Detail } from "../../lib/energy-review/types";
import { DatePicker } from "../ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Device } from "../../pages/api/energy-review";

type DetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Detail, "id">) => Promise<void>;
  initialData?: Detail;
  mode: "create" | "edit";
};

const PERFORMANCE_EVALUATION_OPTIONS = [
  "不合格",
  "正在改善中",
  "初評具潛力",
  "不確定",
] as const;

type PerformanceEvaluation = (typeof PERFORMANCE_EVALUATION_OPTIONS)[number];

const DATA_QUALITY_OPTIONS = [1, 2] as const;

type DataQuality = (typeof DATA_QUALITY_OPTIONS)[number];

interface DeviceSelection {
  [key: string]: boolean;
}

export function DetailDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: DetailDialogProps) {
  const initialFormData = useMemo(
    () => ({
      name: "",
      type: "",
      group: "",
      area: "",
      department: "",
      workHours: undefined,
      workDays: undefined,
      loadFactor: undefined,
      quantity: undefined,
      totalHours: 0,
      kwPerHour: 0,
      actualEnergy: 0,
      actualConsumption: undefined,
      startDate: "",
      endDate: "",
      dataQuality: null as unknown as DataQuality,
      performanceEvaluation: "" as PerformanceEvaluation,
    }),
    []
  );

  const [formData, setFormData] = useState<Omit<Detail, "id">>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("生產設備");
  const [selectedDevices, setSelectedDevices] = useState<DeviceSelection>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setFormData(initialData);
    } else if (!open) {
      setFormData(initialFormData);
    }
  }, [open, initialData, initialFormData]);

  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/energy-review?type=devices");
        if (!response.ok) {
          throw new Error("Failed to fetch devices");
        }
        const data = await response.json();
        setDevices(data.devices || []);
        setSelectedDevices({});
        setSelectAll(false);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setDevices([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (mode === "create") {
      fetchDevices();
    }
  }, [mode]);

  const handleInputChange = useCallback(
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      },
    []
  );

  const handleSubmit = async () => {
    try {
      if (mode === "create") {
        const selectedDeviceIds = Object.entries(selectedDevices)
          .filter(([, isSelected]) => isSelected) // Changed from [_, isSelected] to [, isSelected]
          .map(([id]) => id);

        if (selectedDeviceIds.length === 0) {
          setError("請選擇至少一個設備");
          return;
        }

        // Create details for each selected device
        for (const deviceId of selectedDeviceIds) {
          const device = devices.find((d) => d.id === deviceId);
          if (device) {
            const detailData = {
              ...formData,
              name: device.name,
              type: device.category === "生產設備" ? "生產設備" : "公用設備",
            };
            await onSubmit(detailData);
          }
        }
      } else {
        if (!formData.name) {
          setError("請填寫名稱");
          return;
        }
        await onSubmit(formData);
      }

      onOpenChange(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedDevices({});
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelection: DeviceSelection = {};
    devices
      .filter(
        (device) => !selectedCategory || device.category === selectedCategory
      )
      .forEach((device) => {
        newSelection[device.id] = newSelectAll;
      });
    setSelectedDevices(newSelection);
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevices((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto DialogContent">
        <DialogHeader>
          <DialogTitle className="DialogTitle">
            {mode === "create" ? "新增項目" : "編輯項目"}
          </DialogTitle>
          <DialogDescription className="DialogDescription">
            {mode === "create"
              ? "請填寫以下設備資訊以新增項目。"
              : "請修改以下設備資訊以更新項目。"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          {mode === "create" ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">設備類型</label>
                <div className="col-span-3">
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇設備類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="生產設備">生產設備</SelectItem>
                      <SelectItem value="非生產設備">非生產設備</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">設備名稱</label>
                <div className="col-span-3 border rounded-md p-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                    <span>全選</span>
                  </div>
                  {devices.length === 0 && isLoading ? (
                    <div className="text-center py-4 text-gray-500">
                      載入中...
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      沒有可用的設備
                    </div>
                  ) : (
                    devices
                      .filter(
                        (device) =>
                          !selectedCategory ||
                          device.category === selectedCategory
                      )
                      .map((device) => (
                        <div
                          key={device.id}
                          className={`flex items-center gap-2 p-2 hover:bg-blue-50 ${
                            selectedDevices[device.id] ? "bg-blue-100" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDevices[device.id] || false}
                            onChange={() => handleDeviceSelect(device.id)}
                            className="w-4 h-4"
                          />
                          <span>{device.name}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                名稱
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                className="col-span-3"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">
              類型
            </label>
            <Input
              id="type"
              value={formData.type}
              onChange={handleInputChange("type")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="group" className="text-right">
              群組
            </label>
            <Input
              id="group"
              value={formData.group}
              onChange={handleInputChange("group")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="area" className="text-right">
              區域
            </label>
            <Input
              id="area"
              value={formData.area}
              onChange={handleInputChange("area")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="department" className="text-right">
              部門
            </label>
            <Input
              id="department"
              value={formData.department}
              onChange={handleInputChange("department")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="workHours" className="text-right">
              工作時數
            </label>
            <Input
              id="workHours"
              type="number"
              value={formData.workHours}
              onChange={handleInputChange("workHours")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="workDays" className="text-right">
              工作天數
            </label>
            <Input
              id="workDays"
              type="number"
              value={formData.workDays}
              onChange={handleInputChange("workDays")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="loadFactor" className="text-right">
              負載係數
            </label>
            <Input
              id="loadFactor"
              type="number"
              value={formData.loadFactor}
              onChange={handleInputChange("loadFactor")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right">
              數量
            </label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange("quantity")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="totalHours" className="text-right">
              總時數
            </label>
            <Input
              id="totalHours"
              type="number"
              value={formData.totalHours}
              onChange={handleInputChange("totalHours")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="kwPerHour" className="text-right">
              每小時耗電量 (kW)
            </label>
            <Input
              id="kwPerHour"
              type="number"
              value={formData.kwPerHour}
              onChange={handleInputChange("kwPerHour")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="actualEnergy" className="text-right">
              實際耗電量
            </label>
            <Input
              id="actualEnergy"
              type="number"
              value={formData.actualEnergy}
              onChange={handleInputChange("actualEnergy")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="actualConsumption" className="text-right">
              實際能耗
            </label>
            <Input
              id="actualConsumption"
              type="number"
              value={formData.actualConsumption}
              onChange={handleInputChange("actualConsumption")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startDate" className="text-right">
              開始日期
            </label>
            <div className="col-span-3">
              <DatePicker
                value={formData.startDate}
                onChange={(value) =>
                  setFormData({ ...formData, startDate: value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endDate" className="text-right">
              結束日期
            </label>
            <div className="col-span-3">
              <DatePicker
                value={formData.endDate}
                onChange={(value) =>
                  setFormData({ ...formData, endDate: value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="dataQuality" className="text-right">
              數據品質
            </label>
            <div className="col-span-3">
              <Select
                value={formData.dataQuality?.toString() || ""}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    dataQuality: parseInt(value) as DataQuality,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇數據品質" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_QUALITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="performanceEvaluation" className="text-right">
              績效評估
            </label>
            <div className="col-span-3">
              <Select
                value={formData.performanceEvaluation}
                onValueChange={(value: PerformanceEvaluation) =>
                  setFormData({ ...formData, performanceEvaluation: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇績效評估" />
                </SelectTrigger>
                <SelectContent>
                  {PERFORMANCE_EVALUATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              onOpenChange(false);
            }}
          >
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

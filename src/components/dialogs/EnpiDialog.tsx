import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState, useEffect } from "react";
import { DatePicker } from "../ui/date-picker";

export interface EnpiFormData {
  title: string;
  baselineCode: string;
  energyType: string;
  unit: string;
  startDate: string;
  frequency: "月" | "週" | "日" | "季";
  dataType: string;
}

interface EnpiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EnpiFormData) => Promise<void>;
  initialData?: EnpiFormData;
  mode: "create" | "edit";
}

export function EnpiDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: EnpiDialogProps) {
  const [formData, setFormData] = useState<EnpiFormData>({
    title: "",
    baselineCode: "",
    energyType: "未設定",
    unit: "",
    startDate: "",
    frequency: "月",
    dataType: "單一量測",
  });

  const [energyTypes, setEnergyTypes] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<string[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/enpi");
        const data = await response.json();
        setEnergyTypes(data.energyTypes || []);
        setFrequencies(data.frequencies || []);
        setDataTypes(data.dataTypes || []);
        setUnits(data.units || []);
      } catch (error) {
        console.error("Failed to load options:", error);
      }
    };

    void fetchOptions();
  }, []);

  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || "",
        baselineCode: initialData?.baselineCode || "",
        energyType: initialData?.energyType || "未設定",
        unit: initialData?.unit || "",
        startDate: initialData?.startDate || "",
        frequency: initialData?.frequency || "月",
        dataType: initialData?.dataType || "單一量測",
      });
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] DialogContent">
        <DialogHeader>
          <DialogTitle className="DialogTitle">
            {mode === "create" ? "新增指標" : "編輯指標"}
          </DialogTitle>
          <DialogDescription className="DialogDescription">
            {mode === "create"
              ? "請填寫以下資訊以創建新的指標。"
              : "請修改以下資訊以更新指標。"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">
              名稱
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="baselineCode" className="text-right">
              基準線代碼
            </label>
            <Input
              id="baselineCode"
              value={formData.baselineCode}
              onChange={(e) =>
                setFormData({ ...formData, baselineCode: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="energyType" className="text-right">
              能源類型
            </label>
            <Select
              value={formData.energyType}
              onValueChange={(value: string) =>
                setFormData({ ...formData, energyType: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇能源類型" />
              </SelectTrigger>
              <SelectContent>
                {energyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="unit" className="text-right">
              單位
            </label>
            <Select
              value={formData.unit}
              onValueChange={(value: string) =>
                setFormData({ ...formData, unit: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇單位" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="dataType" className="text-right">
              數據類型
            </label>
            <Select
              value={formData.dataType}
              onValueChange={(value: string) =>
                setFormData({ ...formData, dataType: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇數據類型" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="frequency" className="text-right">
              頻率
            </label>
            <Select
              value={formData.frequency}
              onValueChange={(value: "月" | "週" | "日" | "季") =>
                setFormData({ ...formData, frequency: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇頻率" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq}頻率
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

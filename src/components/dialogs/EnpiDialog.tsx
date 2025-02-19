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
import { getECFs } from "@/lib/energy-ecf/service";
import { getBaselineList } from "@/lib/energy-enb/service";
import type { ECF } from "@/lib/energy-ecf/types";
import { useCompany } from "@/contexts/CompanyContext";

export interface EnpiFormData {
  title: string;
  baselineName: string;
  ebSgt: string;
  energyType: {
    id: string;
    name: string;
    unit: string;
  };
  unit: string;
  startDate: string;
  frequency: "月" | "週" | "日" | "季";
  dataType: string;
  remark?: string | null;
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
    baselineName: "",
    ebSgt: "",
    energyType: {
      id: "",
      name: "(未設定)",
      unit: "",
    },
    unit: "",
    startDate: "",
    frequency: "月",
    dataType: "單一量測",
    remark: null,
  });

  const [energyTypes, setEnergyTypes] = useState<ECF[]>([]);
  const [baselineList, setBaselineList] = useState<Record<string, string>>({});
  const [frequencies] = useState<string[]>(["月", "週", "日", "季"]);
  const [dataTypes] = useState<string[]>(["單一量測", "比率分析"]);
  const { companyName, isSchemaInitialized } = useCompany();

  useEffect(() => {
    const fetchOptions = async () => {
      if (!isSchemaInitialized) return;

      try {
        const [ecfs, baselineListData] = await Promise.all([
          getECFs(companyName),
          getBaselineList(companyName),
        ]);

        setEnergyTypes(ecfs);
        setBaselineList(baselineListData);
      } catch (error) {
        console.error("Failed to load options:", error);
      }
    };

    void fetchOptions();
  }, [companyName, isSchemaInitialized]);

  useEffect(() => {
    if (open) {
      const ebSgt = initialData?.baselineName
        ? Object.entries(baselineList).find(
            ([, name]) => name === initialData.baselineName
          )?.[0] || ""
        : "";

      setFormData({
        title: initialData?.title || "",
        baselineName: initialData?.baselineName || "",
        ebSgt,
        energyType: initialData?.energyType || {
          id: "",
          name: "(未設定)",
          unit: "",
        },
        unit: initialData?.unit || "",
        startDate: initialData?.startDate || "",
        frequency: initialData?.frequency || "月",
        dataType: initialData?.dataType || "單一量測",
        remark: initialData?.remark || null,
      });
    }
  }, [open, initialData, baselineList]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleEnergyTypeChange = (id: string) => {
    const selectedType = energyTypes.find((type) => type.id === id);
    if (selectedType) {
      setFormData({
        ...formData,
        energyType: {
          id: selectedType.id,
          name: selectedType.name,
          unit: selectedType.unit,
        },
        unit: selectedType.unit,
      });
    }
  };

  const handleBaselineChange = (baselineCode: string) => {
    console.log("Selected baseline code:", baselineCode);
    console.log("Selected baseline name:", baselineList[baselineCode]);
    setFormData({
      ...formData,
      baselineName: baselineList[baselineCode],
      ebSgt: baselineCode,
    });
  };

  const getBaselineCodeFromName = (name: string) => {
    return (
      Object.entries(baselineList).find(([, value]) => value === name)?.[0] ||
      ""
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto DialogContent">
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
            <label htmlFor="baselineName" className="text-right">
              基準線名稱
            </label>
            <Select
              value={getBaselineCodeFromName(formData.baselineName)}
              onValueChange={handleBaselineChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇基準線" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(baselineList).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="energyType" className="text-right">
              能源類型
            </label>
            <Select
              value={formData.energyType.id}
              onValueChange={handleEnergyTypeChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇能源類型" />
              </SelectTrigger>
              <SelectContent>
                {energyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="unit" className="text-right">
              單位
            </label>
            <Input
              id="unit"
              value={formData.unit}
              disabled
              className="col-span-3"
            />
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

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="remark" className="text-right">
              備註
            </label>
            <Input
              id="remark"
              value={formData.remark || ""}
              onChange={(e) =>
                setFormData({ ...formData, remark: e.target.value })
              }
              className="col-span-3"
              placeholder="請輸入備註"
            />
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

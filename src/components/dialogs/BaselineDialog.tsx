import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { getAreas } from "@/lib/area-settings/service";
import { getECFs } from "@/lib/energy-ecf/service";
import { getSubjects } from "@/lib/energy-subject/service";
import { useCompany } from "@/contexts/CompanyContext";

export interface BaselineFormData {
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
  X1State: boolean;
  X2State: boolean;
  X3State: boolean;
  X4State: boolean;
  X5State: boolean;
  X1Unit?: string;
  X2Unit?: string;
  X3Unit?: string;
  X4Unit?: string;
  X5Unit?: string;
  ebSgt?: number;
}

interface BaselineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BaselineFormData) => Promise<void>;
  initialData?: BaselineFormData;
  mode: "create" | "edit";
}

interface SelectOptions {
  targetItems: readonly string[];
  energyTypes: string[];
  workAreas: string[];
  sharedGroups: string[];
  lockedStates: string[];
}

const TARGET_ITEMS = ["全公司", "能源分類", "設備群組", "工作場域"] as const;
// type TargetItem = (typeof TARGET_ITEMS)[number];

export function BaselineDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: BaselineDialogProps) {
  const [formData, setFormData] = useState<BaselineFormData>({
    baselineCode: "",
    targetItem: "",
    energyType: "(未設定)",
    workArea: "(未設定)",
    sharedGroup: "(未設定)",
    locked: "",
    note: "",
    X1: "未使用",
    X2: "未使用",
    X3: "未使用",
    X4: "未使用",
    X5: "未使用",
    X1State: false,
    X2State: false,
    X3State: false,
    X4State: false,
    X5State: false,
    X1Unit: "",
    X2Unit: "",
    X3Unit: "",
    X4Unit: "",
    X5Unit: "",
  });

  const { companyName } = useCompany();
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<SelectOptions>({
    targetItems: [],
    energyTypes: [],
    workAreas: [],
    sharedGroups: [],
    lockedStates: [],
  });

  const [energyTypeLabels, setEnergyTypeLabels] = useState<
    Record<string, string>
  >({});
  const [areaLabels, setAreaLabels] = useState<Record<string, string>>({});
  const [deptLabels, setDeptLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch energy types from service
        const ecfData = await getECFs(companyName);
        const energyTypeMap: Record<string, string> = {};
        ecfData.forEach((ecf) => {
          energyTypeMap[ecf.code] = ecf.name;
        });
        setEnergyTypeLabels(energyTypeMap);

        // Fetch areas from service
        const areaData = await getAreas(companyName);
        const areaMap: Record<string, string> = {};
        areaData.forEach((area) => {
          areaMap[area.id] = area.name;
        });
        setAreaLabels(areaMap);

        // Fetch subjects (shared groups) from service
        const subjectData = await getSubjects(companyName);
        const subjectMap: Record<string, string> = {};
        subjectData.forEach((subject) => {
          if (subject.id) {
            subjectMap[subject.id] = subject.name;
          }
        });
        setDeptLabels(subjectMap);

        setOptions({
          targetItems: [...TARGET_ITEMS],
          energyTypes: Object.keys(energyTypeMap),
          workAreas: Object.keys(areaMap),
          sharedGroups: Object.keys(subjectMap),
          lockedStates: ["鎖定", "未鎖定"],
        });
      } catch (error) {
        console.error("Error fetching options:", error);
        // Set default values if fetch fails
        setOptions({
          targetItems: [...TARGET_ITEMS],
          energyTypes: [],
          workAreas: [],
          sharedGroups: [],
          lockedStates: ["鎖定", "未鎖定"],
        });
      }
    };

    if (open && companyName) {
      fetchOptions();
    }
  }, [open, companyName]);

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        ...initialData,
        X3: initialData.X3 ?? "未使用",
        X4: initialData.X4 ?? "未使用",
        X5: initialData.X5 ?? "未使用",
        X1State: initialData.X1 !== "未使用" && initialData.X1 !== "",
        X2State: initialData.X2 !== "未使用" && initialData.X2 !== "",
        X3State: initialData.X3
          ? initialData.X3 !== "未使用" && initialData.X3 !== ""
          : false,
        X4State: initialData.X4
          ? initialData.X4 !== "未使用" && initialData.X4 !== ""
          : false,
        X5State: initialData.X5
          ? initialData.X5 !== "未使用" && initialData.X5 !== ""
          : false,
      });
    } else if (!open) {
      setFormData({
        baselineCode: "",
        targetItem: "",
        energyType: "(未設定)",
        workArea: "(未設定)",
        sharedGroup: "(未設定)",
        locked: "",
        note: "",
        X1: "未使用",
        X2: "未使用",
        X3: "未使用",
        X4: "未使用",
        X5: "未使用",
        X1State: false,
        X2State: false,
        X3State: false,
        X4State: false,
        X5State: false,
        X1Unit: "",
        X2Unit: "",
        X3Unit: "",
        X4Unit: "",
        X5Unit: "",
      });
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    try {
      // Log the submission attempt
      console.log("=== Submitting Baseline Form ===");
      console.log("Company:", companyName);
      console.log("Form Data:", formData);

      // Validate required fields
      if (!formData.baselineCode || !formData.targetItem || !formData.locked) {
        setError("請填寫必要欄位：基線代碼、標的選項、狀態");
        return;
      }

      // Validate conditional required fields based on target item
      if (
        formData.targetItem === "能源分類" &&
        formData.energyType === "(未設定)"
      ) {
        setError("能源分類需要選擇能源類型");
        return;
      }
      if (
        formData.targetItem === "設備群組" &&
        formData.sharedGroup === "(未設定)"
      ) {
        setError("設備群組需要選擇共用群組");
        return;
      }
      if (
        formData.targetItem === "工作場域" &&
        formData.workArea === "(未設定)"
      ) {
        setError("工作場域需要選擇工作區域");
        return;
      }

      // Validate X variables
      if (formData.X1State && !formData.X1) {
        setError("X1 變數已啟用但未填寫名稱");
        return;
      }
      if (formData.X2State && !formData.X2) {
        setError("X2 變數已啟用但未填寫名稱");
        return;
      }
      if (formData.X3State && !formData.X3) {
        setError("X3 變數已啟用但未填寫名稱");
        return;
      }
      if (formData.X4State && !formData.X4) {
        setError("X4 變數已啟用但未填寫名稱");
        return;
      }
      if (formData.X5State && !formData.X5) {
        setError("X5 變數已啟用但未填寫名稱");
        return;
      }

      // Log before API call
      console.log("=== Calling API ===");
      console.log("Endpoint: /api/enb");
      console.log("Method: POST");
      console.log("Query params:", { company: companyName });

      await onSubmit(formData);
      console.log("=== API Call Successful ===");
      onOpenChange(false);
      setError(null);
    } catch (err) {
      console.error("=== API Call Failed ===");
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    }
  };

  const handleTargetItemChange = (value: string) => {
    // Reset dependent fields to (未設定) when target item changes
    setFormData({
      ...formData,
      targetItem: value,
      energyType: "(未設定)",
      workArea: "(未設定)",
      sharedGroup: "(未設定)",
    });
  };

  // Determine which fields should be disabled based on target item
  const isEnergyTypeDisabled =
    formData.targetItem === "全公司" ||
    formData.targetItem === "設備群組" ||
    formData.targetItem === "工作場域";

  const isWorkAreaDisabled =
    formData.targetItem === "全公司" ||
    formData.targetItem === "能源分類" ||
    formData.targetItem === "設備群組";

  const isSharedGroupDisabled =
    formData.targetItem === "全公司" ||
    formData.targetItem === "能源分類" ||
    formData.targetItem === "工作場域";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新增基線" : "編輯基線"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "請填寫以下資訊以新增基線。"
              : "請修改以下資訊以更新基線。"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="baselineCode" className="text-right">
              基線代碼
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
            <label htmlFor="targetItem" className="text-right">
              標的選項
            </label>
            <Select
              value={formData.targetItem}
              onValueChange={handleTargetItemChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇標的選項" />
              </SelectTrigger>
              <SelectContent>
                {options.targetItems.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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
              value={formData.energyType}
              onValueChange={(value) =>
                setFormData({ ...formData, energyType: value })
              }
              disabled={isEnergyTypeDisabled}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="未設定" />
              </SelectTrigger>
              <SelectContent>
                {options.energyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {energyTypeLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sharedGroup" className="text-right">
              共用群組
            </label>
            <Select
              value={formData.sharedGroup}
              onValueChange={(value) =>
                setFormData({ ...formData, sharedGroup: value })
              }
              disabled={isSharedGroupDisabled}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="未設定" />
              </SelectTrigger>
              <SelectContent>
                {options.sharedGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {deptLabels[group] || group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="workArea" className="text-right">
              工作區域
            </label>
            <Select
              value={formData.workArea}
              onValueChange={(value) =>
                setFormData({ ...formData, workArea: value })
              }
              disabled={isWorkAreaDisabled}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="未設定" />
              </SelectTrigger>
              <SelectContent>
                {options.workAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {areaLabels[area] || area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="locked" className="text-right">
              狀態
            </label>
            <Select
              value={formData.locked}
              onValueChange={(value) =>
                setFormData({ ...formData, locked: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                {options.lockedStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="note" className="text-right">
              備註
            </label>
            <Input
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="X1" className="text-right">
              變數 X1
            </label>
            <div className="col-span-3 flex items-center gap-4">
              <Switch
                checked={formData.X1State}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    X1State: checked,
                    X1: checked ? "" : "未使用",
                    X1Unit: checked ? formData.X1Unit : "",
                  })
                }
              />
              <div className="flex-1 flex gap-2">
                <Input
                  id="X1"
                  value={formData.X1}
                  onChange={(e) =>
                    setFormData({ ...formData, X1: e.target.value })
                  }
                  className="flex-1"
                  disabled={!formData.X1State}
                  placeholder="未使用"
                />
                <Input
                  id="X1Unit"
                  value={formData.X1Unit}
                  onChange={(e) =>
                    setFormData({ ...formData, X1Unit: e.target.value })
                  }
                  className="w-[120px]"
                  disabled={!formData.X1State}
                  placeholder="單位"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="X2" className="text-right">
              變數 X2
            </label>
            <div className="col-span-3 flex items-center gap-4">
              <Switch
                checked={formData.X2State}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    X2State: checked,
                    X2: checked ? "" : "未使用",
                    X2Unit: checked ? formData.X2Unit : "",
                  })
                }
              />
              <div className="flex-1 flex gap-2">
                <Input
                  id="X2"
                  value={formData.X2}
                  onChange={(e) =>
                    setFormData({ ...formData, X2: e.target.value })
                  }
                  className="flex-1"
                  disabled={!formData.X2State}
                  placeholder="未使用"
                />
                <Input
                  id="X2Unit"
                  value={formData.X2Unit}
                  onChange={(e) =>
                    setFormData({ ...formData, X2Unit: e.target.value })
                  }
                  className="w-[120px]"
                  disabled={!formData.X2State}
                  placeholder="單位"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="X3" className="text-right">
              變數 X3
            </label>
            <div className="col-span-3 flex items-center gap-4">
              <Switch
                checked={formData.X3State}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    X3State: checked,
                    X3: checked ? "" : "未使用",
                    X3Unit: checked ? formData.X3Unit : "",
                  })
                }
              />
              <div className="flex-1 flex gap-2">
                <Input
                  id="X3"
                  value={formData.X3}
                  onChange={(e) =>
                    setFormData({ ...formData, X3: e.target.value })
                  }
                  className="flex-1"
                  disabled={!formData.X3State}
                  placeholder="未使用"
                />
                <Input
                  id="X3Unit"
                  value={formData.X3Unit}
                  onChange={(e) =>
                    setFormData({ ...formData, X3Unit: e.target.value })
                  }
                  className="w-[120px]"
                  disabled={!formData.X3State}
                  placeholder="單位"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="X4" className="text-right">
              變數 X4
            </label>
            <div className="col-span-3 flex items-center gap-4">
              <Switch
                checked={formData.X4State}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    X4State: checked,
                    X4: checked ? "" : "未使用",
                    X4Unit: checked ? formData.X4Unit : "",
                  })
                }
              />
              <div className="flex-1 flex gap-2">
                <Input
                  id="X4"
                  value={formData.X4}
                  onChange={(e) =>
                    setFormData({ ...formData, X4: e.target.value })
                  }
                  className="flex-1"
                  disabled={!formData.X4State}
                  placeholder="未使用"
                />
                <Input
                  id="X4Unit"
                  value={formData.X4Unit}
                  onChange={(e) =>
                    setFormData({ ...formData, X4Unit: e.target.value })
                  }
                  className="w-[120px]"
                  disabled={!formData.X4State}
                  placeholder="單位"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="X5" className="text-right">
              變數 X5
            </label>
            <div className="col-span-3 flex items-center gap-4">
              <Switch
                checked={formData.X5State}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    X5State: checked,
                    X5: checked ? "" : "未使用",
                    X5Unit: checked ? formData.X5Unit : "",
                  })
                }
              />
              <div className="flex-1 flex gap-2">
                <Input
                  id="X5"
                  value={formData.X5}
                  onChange={(e) =>
                    setFormData({ ...formData, X5: e.target.value })
                  }
                  className="flex-1"
                  disabled={!formData.X5State}
                  placeholder="未使用"
                />
                <Input
                  id="X5Unit"
                  value={formData.X5Unit}
                  onChange={(e) =>
                    setFormData({ ...formData, X5Unit: e.target.value })
                  }
                  className="w-[120px]"
                  disabled={!formData.X5State}
                  placeholder="單位"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

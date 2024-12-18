import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import type { Detail } from "../../lib/energy-review/types";

type DetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Detail, "id">) => Promise<void>;
  initialData?: Detail;
  mode: "create" | "edit";
};

export function DetailDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: DetailDialogProps) {
  const [formData, setFormData] = useState<Omit<Detail, "id">>({
    name: "",
    type: "",
    group: "",
    area: "",
    department: "",
    workHours: 0,
    workDays: 0,
    dailyHours: 0,
    workingDays: 0,
    totalHours: 0,
    kwPerHour: 0,
    actualEnergy: 0,
    actualConsumption: 0,
    startDate: "",
    endDate: "",
    dataQuality: 0,
    performanceEvaluation: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name || "",
        type: initialData?.type || "",
        group: initialData?.group || "",
        area: initialData?.area || "",
        department: initialData?.department || "",
        workHours: initialData?.workHours || 0,
        workDays: initialData?.workDays || 0,
        dailyHours: initialData?.dailyHours || 0,
        workingDays: initialData?.workingDays || 0,
        totalHours: initialData?.totalHours || 0,
        kwPerHour: initialData?.kwPerHour || 0,
        actualEnergy: initialData?.actualEnergy || 0,
        actualConsumption: initialData?.actualConsumption || 0,
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        dataQuality: initialData?.dataQuality || 0,
        performanceEvaluation: initialData?.performanceEvaluation || "",
      });
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    await onSubmit(formData);
    onOpenChange(false);
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              名稱
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">
              類型
            </label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, group: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, workHours: Number(e.target.value) })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, workDays: Number(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="dailyHours" className="text-right">
              每日時數
            </label>
            <Input
              id="dailyHours"
              type="number"
              value={formData.dailyHours}
              onChange={(e) =>
                setFormData({ ...formData, dailyHours: Number(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="workingDays" className="text-right">
              工作天數
            </label>
            <Input
              id="workingDays"
              type="number"
              value={formData.workingDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workingDays: Number(e.target.value),
                })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, totalHours: Number(e.target.value) })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, kwPerHour: Number(e.target.value) })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actualEnergy: Number(e.target.value),
                })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actualConsumption: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startDate" className="text-right">
              開始日期
            </label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endDate" className="text-right">
              結束日期
            </label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="dataQuality" className="text-right">
              數據品質
            </label>
            <Input
              id="dataQuality"
              type="number"
              value={formData.dataQuality}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dataQuality: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="performanceEvaluation" className="text-right">
              績效評估
            </label>
            <Input
              id="performanceEvaluation"
              value={formData.performanceEvaluation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  performanceEvaluation: e.target.value,
                })
              }
              className="col-span-3"
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

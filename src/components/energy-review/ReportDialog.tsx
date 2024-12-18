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
import type { Report } from "../../lib/energy-review/types";

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Report, "reviewerId">) => Promise<void>;
  initialData?: Report;
  mode: "create" | "edit";
};

export function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ReportDialogProps) {
  const [formData, setFormData] = useState<Omit<Report, "reviewerId">>({
    title: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
      });
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] DialogContent [&>button]:bg-destructive [&>button]:hover:bg-destructive/90">
        <DialogHeader>
          <DialogTitle className="DialogTitle">
            {mode === "create" ? "新增報告" : "編輯報告"}
          </DialogTitle>
          <DialogDescription className="DialogDescription">
            {mode === "create"
              ? "請填寫以下資訊以創建新的報告。"
              : "請修改以下資訊以更新報告。"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">
              標題
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

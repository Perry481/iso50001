import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DeviceReferenceDialog } from "./DeviceReferenceDialog";
import { type DeviceReference } from "../../pages/api/energy-equipment";

export type FieldType = "text" | "number" | "date" | "select";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  selectContentProps?: React.HTMLAttributes<HTMLDivElement>;
}

interface DetailDialogProps<T extends { id?: string | number }> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<T, "id">) => Promise<void>;
  initialData?: T;
  mode: "create" | "edit";
  title: string;
  description: string;
  fields: Field[];
  showDeviceReference?: boolean;
}

type FormDataType = Record<string, string | number>;

export function DetailDialog<T extends { id?: string | number }>({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  title,
  description,
  fields,
  showDeviceReference = false,
}: DetailDialogProps<T>) {
  const [formData, setFormData] = useState<FormDataType>({});
  const [error, setError] = useState<string | null>(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setFormData(initialData as FormDataType);
    } else if (!open) {
      // Reset form data when dialog closes
      const defaultData = fields.reduce((acc, field) => {
        acc[field.key] = field.type === "number" ? 0 : "";
        return acc;
      }, {} as FormDataType);
      setFormData(defaultData);
      // Reset error state when dialog closes
      setError(null);
    }
  }, [open, initialData, fields]);

  const handleInputChange =
    (key: string, type: FieldType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = type === "number" ? Number(e.target.value) : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleDateChange = (key: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectChange = (key: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const missingFields = fields
        .filter((field) => field.required && !formData[field.key])
        .map((field) => field.label);

      if (missingFields.length > 0) {
        setError(`請填寫以下必要欄位：${missingFields.join(", ")}`);
        return;
      }

      await onSubmit(formData as Omit<T, "id">);
      onOpenChange(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    }
  };

  const handleDeviceSelect = (device: DeviceReference) => {
    setFormData((prev) => ({
      ...prev,
      code: device.MachineID,
      referenceCode: device.MachineID,
      name: device.MachineName,
      ratedPower: device.KWHour || 0,
      powerUnit: "度",
    }));
  };

  const renderField = (field: Field) => {
    const { key, label, type, options, placeholder } = field;

    // Special handling for code field (設備編號)
    if (key === "code" && showDeviceReference) {
      return (
        <div className="col-span-3 flex gap-2">
          <Input
            id={key}
            type={type}
            value={formData[key]?.toString() || ""}
            onChange={handleInputChange(key, type)}
            className="flex-1"
            placeholder={placeholder}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeviceDialogOpen(true)}
          >
            選擇
          </Button>
        </div>
      );
    }

    // Handle other fields normally
    switch (type) {
      case "date":
        return (
          <div className="col-span-3">
            <DatePicker
              value={formData[key]?.toString() || ""}
              onChange={handleDateChange(key)}
            />
          </div>
        );

      case "select":
        if (!options) return null;
        return (
          <div className="col-span-3">
            <Select
              value={formData[key]?.toString() || ""}
              onValueChange={handleSelectChange(key)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder || `選擇${label}`} />
              </SelectTrigger>
              <SelectContent {...field.selectContentProps}>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return (
          <Input
            id={key}
            type={type}
            value={formData[key]?.toString() || ""}
            onChange={handleInputChange(key, type)}
            className="col-span-3"
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto DialogContent">
          <DialogHeader>
            <DialogTitle className="DialogTitle">
              {mode === "create" ? `新增${title}` : `編輯${title}`}
            </DialogTitle>
            <DialogDescription className="DialogDescription">
              {mode === "create"
                ? `請填寫以下資訊以新增${description}。`
                : `請修改以下資訊以更新${description}。`}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-4 items-center gap-4"
              >
                <label htmlFor={field.key} className="text-right">
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeviceReferenceDialog
        open={deviceDialogOpen}
        onOpenChange={setDeviceDialogOpen}
        onSelect={handleDeviceSelect}
      />
    </>
  );
}

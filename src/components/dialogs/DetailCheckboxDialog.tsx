import { useState, useEffect, useCallback } from "react";
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
import type { Field } from "./DetailDialog";
import type { Equipment } from "@/lib/energy-equipment/types";
import { energyEquipmentService } from "@/lib/energy-equipment/service";
import { Loader2 } from "lucide-react";

interface DetailCheckboxDialogProps<T extends { id?: string | number }> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<T, "id">,
    selectedEquipments: Equipment[]
  ) => Promise<void>;
  initialData?: T;
  mode: "create" | "edit";
  title: string;
  description: string;
  fields: Field[];
}

type FormDataType = Record<string, string | number>;

export function DetailCheckboxDialog<T extends { id?: string | number }>({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  title,
  description,
  fields,
}: DetailCheckboxDialogProps<T>) {
  const [formData, setFormData] = useState<FormDataType>({});
  const [error, setError] = useState<string | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"生產設備" | "非生產設備">(
    "生產設備"
  );

  const calculateActualConsumption = useCallback(
    (hours: number, kwPerHour: number) => {
      return hours * kwPerHour;
    },
    []
  );

  const loadEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await energyEquipmentService.getEquipments();
      const filteredEquipments = data.filter(
        (eq) => eq.equipmentType === selectedType
      );
      setEquipments(filteredEquipments);
    } catch (error) {
      console.error("Failed to load equipments:", error);
      setError("載入設備清單失敗");
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    if (open) {
      loadEquipments();
    }
  }, [open, loadEquipments]);

  useEffect(() => {
    if (open && initialData) {
      setFormData(initialData as FormDataType);
    } else if (!open) {
      // Reset form data when dialog closes
      const defaultData = fields.reduce((acc, field) => {
        if (field.key === "loadFactor") {
          acc[field.key] = 1;
        } else if (field.key === "dataQuality") {
          acc[field.key] = 2;
        } else if (field.key === "performanceEvaluation") {
          acc[field.key] = "不確定";
        } else {
          acc[field.key] = field.type === "number" ? 0 : "";
        }
        return acc;
      }, {} as FormDataType);
      setFormData(defaultData);
      setSelectedEquipments(new Set());
      setError(null);
    }
  }, [open, initialData, fields]);

  const handleInputChange = (field: Field, value: string | number) => {
    setFormData((prev) => {
      const updates: FormDataType = {
        ...prev,
        [field.key]: value,
      };

      // Calculate actualConsumption when totalHours or kwPerHour changes
      if (field.key === "totalHours" || field.key === "kwPerHour") {
        const hours =
          field.key === "totalHours"
            ? Number(value)
            : Number(prev.totalHours || 0);
        const kw =
          field.key === "kwPerHour"
            ? Number(value)
            : Number(prev.kwPerHour || 0);
        updates.actualConsumption = calculateActualConsumption(hours, kw);
      }

      return updates;
    });
  };

  const handleCheckboxChange = (equipmentId: string) => {
    setSelectedEquipments((prev) => {
      const next = new Set(prev);
      if (next.has(equipmentId)) {
        next.delete(equipmentId);
        // Reset fields if no equipment is selected
        if (next.size === 0) {
          setFormData((prev) => ({
            ...prev,
            name: "",
            type: "",
            group: "",
            area: "",
            kwPerHour: 0,
            quantity: 0,
            loadFactor: 1,
            totalHours: 0,
            actualConsumption: 0,
            dataQuality: 2,
            performanceEvaluation: "不確定",
          }));
        }
      } else {
        next.add(equipmentId);
        // Get the selected equipment and update form data
        const equipment = equipments.find((eq) => eq.id === equipmentId);
        if (equipment) {
          const totalHours = 0; // Start with 0 total hours
          setFormData((prev) => ({
            ...prev,
            name: equipment.name,
            type: equipment.equipmentType,
            group: equipment.usageGroup,
            area: equipment.workArea,
            kwPerHour: equipment.ratedPower || 0,
            quantity: equipment.quantity,
            loadFactor: 1,
            totalHours: totalHours,
            actualConsumption: calculateActualConsumption(
              totalHours,
              equipment.ratedPower || 0
            ),
            dataQuality: 2,
            performanceEvaluation: "不確定",
          }));
        }
      }
      return next;
    });
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

      const selectedEquipmentList = equipments.filter((eq) =>
        selectedEquipments.has(eq.id)
      );

      await onSubmit(formData as Omit<T, "id">, selectedEquipmentList);
      onOpenChange(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto DialogContent">
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

        <div className="grid grid-cols-2 gap-4">
          {/* Equipment Checkboxes */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={
                    equipments.length > 0 &&
                    selectedEquipments.size === equipments.length
                  }
                  onChange={() => {
                    if (selectedEquipments.size === equipments.length) {
                      setSelectedEquipments(new Set());
                    } else {
                      setSelectedEquipments(
                        new Set(equipments.map((eq) => eq.id))
                      );
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-600">全選</span>
              </div>
              <Select
                value={selectedType}
                onValueChange={(value: "生產設備" | "非生產設備") =>
                  setSelectedType(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="生產設備">生產設備</SelectItem>
                  <SelectItem value="非生產設備">非生產設備</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : equipments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                沒有可用的設備
              </div>
            ) : (
              <div className="space-y-2 max-h-[840px] overflow-y-auto pr-2">
                {equipments.map((equipment) => (
                  <div
                    key={equipment.id}
                    className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                      selectedEquipments.has(equipment.id)
                        ? "border-blue-500 bg-blue-50/50"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => handleCheckboxChange(equipment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={equipment.id}
                          checked={selectedEquipments.has(equipment.id)}
                          onChange={() => handleCheckboxChange(equipment.id)}
                          className="h-4 w-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <div className="font-medium">{equipment.name}</div>
                          <div className="text-sm text-gray-500">
                            編號: {equipment.code}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {equipment.ratedPower
                            ? `${equipment.ratedPower} ${equipment.powerUnit}`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {fields.map((field) => {
              // Determine if field should be disabled
              const isDisabled =
                (field.key === "name" ||
                  field.key === "type" ||
                  field.key === "group" ||
                  field.key === "area" ||
                  field.key === "kwPerHour" ||
                  field.key === "quantity") &&
                selectedEquipments.size > 0;

              return (
                <div
                  key={field.key}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <label htmlFor={field.key} className="text-right">
                    {field.label}
                  </label>
                  <div className="col-span-3">
                    {field.type === "date" ? (
                      <DatePicker
                        value={formData[field.key]?.toString() || ""}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            [field.key]: value,
                          }))
                        }
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={formData[field.key]?.toString() || ""}
                        onValueChange={(value) =>
                          handleInputChange(field, value)
                        }
                        disabled={isDisabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              field.placeholder || `選擇${field.label}`
                            }
                          />
                        </SelectTrigger>
                        <SelectContent {...field.selectContentProps}>
                          {field.options?.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData[field.key]?.toString() || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field,
                            field.type === "number"
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        disabled={isDisabled || field.disabled}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { areaSettingsService } from "@/lib/area-settings/service";
import { energyECFService } from "@/lib/energy-ecf/service";
import { deptListService } from "@/lib/dept-list/service";

interface BaselineItem {
  id?: number | string;
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
  ebSgt: number;
}

interface BaselineListingProps {
  items: BaselineItem[];
  title: string;
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditItem: (item: BaselineItem) => void;
  onDeleteItem: (item: BaselineItem) => void;
  onAddItem: () => void;
  onItemClick?: (item: BaselineItem) => void;
  addButtonText?: string;
}

export function BaselineListing({
  items,
  title,
  itemsPerPage = 4,
  currentPage,
  onPageChange,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onItemClick,
  addButtonText = "新增",
}: BaselineListingProps) {
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});
  const [energyTypeMap, setEnergyTypeMap] = useState<Record<string, string>>(
    {}
  );
  const [deptMap, setDeptMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load areas
        const areaData = await areaSettingsService.getAreas();
        const areaMap: Record<string, string> = {};
        areaData.forEach((area) => {
          areaMap[area.id] = area.name;
        });
        setAreaMap(areaMap);

        // Load energy types
        const ecfData = await energyECFService.getECFs();
        const ecfMap: Record<string, string> = {};
        ecfData.forEach((ecf) => {
          ecfMap[ecf.code] = ecf.name;
        });
        setEnergyTypeMap(ecfMap);

        // Load departments
        const deptData = await deptListService.getDepts();
        const deptMap: Record<string, string> = {};
        deptData.forEach((dept) => {
          deptMap[dept.value] = dept.label;
        });
        setDeptMap(deptMap);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handleItemClick = (item: BaselineItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">{title}</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              第 {currentPage} 頁，共 {totalPages} 頁
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="hover:!outline hover:!outline-1 hover:!outline-blue-500"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4 mr-2" /> {addButtonText}
        </Button>
      </div>

      <div className="space-y-4">
        {currentItems.map((item) => (
          <div
            key={item.id || item.baselineCode}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {item.baselineCode}
                    </h3>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-50"
                        onClick={() => onEditItem(item)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-50"
                        onClick={() => onDeleteItem(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-500">標的選項：</span>
                        <span className="text-gray-900">
                          {item.targetItem || "(未設定)"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">能源類型：</span>
                        <span className="text-gray-900">
                          {energyTypeMap[item.energyType] ||
                            item.energyType ||
                            "(未設定)"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">工作區域：</span>
                        <span className="text-gray-900">
                          {areaMap[item.workArea] ||
                            item.workArea ||
                            "(未設定)"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">狀態：</span>
                        <span className="text-gray-900">
                          {item.locked || "(未設定)"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">共用群組：</span>
                        <span className="text-gray-900">
                          {deptMap[item.sharedGroup] ||
                            item.sharedGroup ||
                            "(未設定)"}
                        </span>
                      </p>
                    </div>

                    <div className="w-[300px]">
                      <p className="text-sm text-gray-500 mb-2">相關變數：</p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-gray-500">X1:</span>{" "}
                          <span className="text-gray-900">{item.X1}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500">X2:</span>{" "}
                          <span className="text-gray-900">{item.X2}</span>
                        </p>
                        {item.X3 && (
                          <p className="text-sm">
                            <span className="text-gray-500">X3:</span>{" "}
                            <span className="text-gray-900">{item.X3}</span>
                          </p>
                        )}
                        {item.X4 && (
                          <p className="text-sm">
                            <span className="text-gray-500">X4:</span>{" "}
                            <span className="text-gray-900">{item.X4}</span>
                          </p>
                        )}
                        {item.X5 && (
                          <p className="text-sm">
                            <span className="text-gray-500">X5:</span>{" "}
                            <span className="text-gray-900">{item.X5}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

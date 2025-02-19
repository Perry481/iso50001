import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export interface BaseItem {
  id?: number | string;
  title: string;
}

interface ListingPageProps<T extends BaseItem> {
  items: T[];
  title: string;
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemClick: (item: T) => void;
  onEditItem: (item: T) => void;
  onDeleteItem: (item: T) => void;
  onAddItem: () => void;
  addButtonText?: string;
  renderItemContent?: (item: T) => React.ReactNode;
  noDelete?: boolean;
  noEdit?: boolean;
  noAdd?: boolean;
}

export function ListingPage<T extends BaseItem>({
  items,
  title,
  itemsPerPage = 4,
  currentPage,
  onPageChange,
  onItemClick,
  onEditItem,
  onDeleteItem,
  onAddItem,
  addButtonText = "新增",
  renderItemContent,
  noDelete,
  noEdit,
  noAdd,
}: ListingPageProps<T>) {
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const defaultRenderItemContent = (item: T) => (
    <>
      <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
      {Object.entries(item)
        .filter(([key]) => !["id", "title"].includes(key))
        .map(([key, value]) => (
          <p key={key} className="text-gray-500 text-sm">
            {key}: {value}
          </p>
        ))}
    </>
  );

  const actualRenderItemContent = renderItemContent || defaultRenderItemContent;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={`hover:!outline hover:!outline-1 hover:!outline-blue-500 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={`hover:!outline hover:!outline-1 hover:!outline-blue-500 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {!noAdd && (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={onAddItem}
          >
            <Plus className="h-4 w-4 mr-2" /> {addButtonText}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {currentItems.map((item) => (
          <div
            key={item.id || item.title}
            className="relative p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:outline hover:outline-1 hover:outline-blue-500 cursor-pointer group"
            onClick={() => onItemClick(item)}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-gray-300 text-sm bg-white/90 px-3 py-1 rounded-full">
                點擊查看詳細資訊
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div className="space-y-1">{actualRenderItemContent(item)}</div>
              <div className="flex gap-2">
                {!noEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
                {!noDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Report } from "@/lib/energy-review/types";

interface PaginatedReportsProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  onEditReport: (report: Report) => void;
  onDeleteReport: (report: Report) => void;
  onAddReport: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginatedReports = ({
  reports,
  onReportClick,
  onEditReport,
  onDeleteReport,
  onAddReport,
  currentPage,
  onPageChange,
}: PaginatedReportsProps) => {
  const reportsPerPage = 4;
  const totalPages = Math.ceil(reports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl">報告列表</h2>
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
          onClick={onAddReport}
        >
          <Plus className="h-4 w-4 mr-2" /> 新增報告
        </Button>
      </div>

      <div className="space-y-2">
        {currentReports.map((report) => (
          <div
            key={report.title}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:outline hover:outline-1 hover:outline-blue-500 cursor-pointer"
            onClick={() => onReportClick(report)}
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {report.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {report.startDate} - {report.endDate}
                </p>
                <p className="text-gray-500 text-sm">
                  審查人員: {report.reviewerId}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditReport(report);
                  }}
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReport(report);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaginatedReports;

import React from "react";
import { RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "./Pagination";

export default function DataTable({ 
  headers = [], 
  rows = [], 
  renderRow,
  pagination = null,
  loading = false
}) {
  if (!headers || headers.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        No headers available
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {headers.map((header, idx) => (
                  <TableCell
                    key={idx}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loading data...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows && rows.length > 0 ? (
                rows.map((row, idx) => (
                  <TableRow key={row._id || idx}>{renderRow(row)}</TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="text-center py-6 text-gray-400"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}

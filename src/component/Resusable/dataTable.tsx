"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Skeleton from 'react-loading-skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  filterFields?: string[];
  filterable?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  filterFields = [],
  filterable = false
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  // Prepare table data and columns
  const tableData = useMemo(
    () => (loading ? Array(5).fill({}) : data),
    [loading, data]
  );

  const tableColumns = useMemo(
    () =>
      loading
        ? columns.map((column) => ({
          ...column,
          cell: () => <Skeleton className="h-4 w-full rounded-sm" />,
        }))
        : columns,
    [loading, columns]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    table.setPageSize(5);
  }, [table]);

  return (
    <>
      {filterable && (
        <div className="relative w-full max-w-sm py-4 text-black">
          <Input
            placeholder={`Filter ${filterFields && filterFields.length > 0 ? filterFields[0] : "email"}...`}
            value={(table.getColumn(filterFields && filterFields.length > 0 ? filterFields[0] : "email")?.getFilterValue() as string) ?? ""}
            onChange={(event) => 
              table.getColumn(filterFields && filterFields.length > 0 ? filterFields[0] : "email")?.setFilterValue(event.target.value)
            }
            className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg w-full"
          />
          <FilterIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {tableColumns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full rounded-sm" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="data-[state=selected]:bg-blue-400"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          className="text-white bg-black"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-white bg-black"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  );
}

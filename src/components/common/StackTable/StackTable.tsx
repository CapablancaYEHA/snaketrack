import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { Flex, Stack } from "@mantine/core";
import { signal } from "@preact/signals";
import { ColumnDef, ColumnFiltersState, OnChangeFn, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import styles from "./styles.module.scss";
import { calcGridLayout } from "./utils";

interface IProp<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  columnFilters?: ColumnFiltersState;
  onRowClick?: (v) => void;
}

const trStyles = signal<string>("");

export const StackTable = <T extends object>({ columns, data, setColumnFilters, columnFilters, onRowClick }: IProp<T>) => {
  const cols: ColumnDef<T>[] = useMemo<ColumnDef<T, unknown>[]>(() => columns, []);

  const table = useReactTable({
    columns: cols,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (columnFilters && setColumnFilters) || undefined,
    debugTable: true,
    state: {
      columnFilters,
    },
  });

  const isEmpty = table.options.data.length === 0;
  const isFilteredOut = table.options.data.length > 0 && table.getRowModel().rows.length === 0;

  return (
    <table className={styles.table}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <tr key={headerGroup.id} style={{ gridTemplateColumns: trStyles.value }}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div className={header.column.getCanSort() ? styles.pointer : ""} onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && !header.column.getIsSorted() ? <IconSwitch icon="arr-bi" width="14" height="14" style={{ display: "inline-block" }} /> : null}
                        {{
                          asc: <IconSwitch icon="arr-up" width="14" height="14" style={{ display: "inline-block" }} />,
                          desc: <IconSwitch icon="arr-up" width="14" height="14" style={{ display: "inline-block", transform: "rotate(180deg)" }} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody>
        {isEmpty ? (
          <Stack align="center" justify="center" w="100%" maw="100%" gap="sm" pb="md" pt="md">
            <IconSwitch icon="no-data" width="40" height="40" />
            Данные для таблицы отсутствуют
          </Stack>
        ) : isFilteredOut ? (
          <Stack align="center" justify="center" w="100%" maw="100%" gap="sm" pb="md" pt="md">
            <IconSwitch icon="no-filter" width="40" height="40" />
            Не найдено элементов для заданной фильтрации
          </Stack>
        ) : (
          table.getRowModel().rows.map((row) => {
            const r = calcGridLayout(row.getVisibleCells());
            trStyles.value = r;

            return (
              <tr key={row.id} onClick={() => onRowClick?.((row.original as any).id)} className={onRowClick != null ? styles.pointer : ""} style={{ gridTemplateColumns: r }}>
                {row.getVisibleCells().map((cell) => {
                  return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

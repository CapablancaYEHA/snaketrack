import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Box, Stack, alpha } from "@mantine/core";
import { Signal } from "@preact/signals";
import { ColumnDef, ColumnFiltersState, GlobalFilterTableState, OnChangeFn, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import styles from "./styles.module.scss";
import { calcColumn, getCommonPinningStyles } from "./utils";

interface IProp<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  columnFilters?: ColumnFiltersState;
  globalFilter?: GlobalFilterTableState;
  setGlobalFilter?: OnChangeFn<GlobalFilterTableState>;
  onRowClick?: (v) => void;
}

export const StackTable = <T extends object>({ columns, data, setColumnFilters, columnFilters, onRowClick, globalFilter, setGlobalFilter }: IProp<T>) => {
  const isMount = useRef(false);
  const [columnPinning, setColumnPinning] = useState({});
  const cols: ColumnDef<T>[] = useMemo<ColumnDef<T, unknown>[]>(() => columns, []);

  const table = useReactTable({
    columns: cols,
    data: data ?? [],
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (columnFilters && setColumnFilters) || undefined,
    onGlobalFilterChange: (globalFilter && setGlobalFilter) || undefined,
    onColumnPinningChange: setColumnPinning,
    debugTable: true,
    state: {
      columnFilters,
      globalFilter,
      columnPinning,
    },
  });

  useEffect(() => {
    isMount.current = true;
  }, []);

  //   header.column.pin('left')

  console.log("columnPinning", columnPinning);

  const isEmpty = isMount.current && table.options.data.length === 0;
  const isFilteredOut = table.options.data.length > 0 && table.getRowModel().rows.length === 0;

  return (
    <Box pos="relative" w="100%" maw="100%" style={{ overflowX: "scroll" }}>
      <table className={styles.table}>
        <thead style={{ background: `${alpha(`var(--mantine-color-dark-7)`, 0.5)}` }}>
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, ind) => {
                  return header.column.columnDef.header ? (
                    <th key={header.id} style={{ ...calcColumn(header as any), ...getCommonPinningStyles(header.column), minWidth: header.column.columnDef.minSize }}>
                      {header.isPlaceholder ? null : (
                        <div className={header.column.getCanSort() ? styles.pointer : ""} onClick={header.column.getToggleSortingHandler()}>
                          <span onClick={() => header.column.pin("left")}>PUK</span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {/* {ind === 0 && !header.column.getIsPinned() && header.column.pin("left")} */}
                          {header.column.getCanSort() && !header.column.getIsSorted() ? <IconSwitch icon="arr-bi" width="14" height="14" style={{ display: "inline-block" }} /> : null}
                          {{
                            asc: <IconSwitch icon="arr-up" width="14" height="14" style={{ display: "inline-block" }} />,
                            desc: <IconSwitch icon="arr-up" width="14" height="14" style={{ display: "inline-block", transform: "rotate(180deg)" }} />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ) : null;
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
              return (
                <tr key={row.id} onClick={() => onRowClick?.((row.original as any).id)} className={onRowClick != null ? styles.pointer : ""}>
                  {row.getVisibleCells().map((cell) => {
                    return cell.column.columnDef.cell ? (
                      <td key={cell.id} style={{ ...calcColumn(cell), ...getCommonPinningStyles(cell.column), minWidth: cell.column.columnDef.minSize }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ) : null;
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Box>
  );
};

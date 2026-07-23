import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/compat";
import { Stack } from "@mantine/core";
import { ColumnDef, ColumnFiltersState, GlobalFilterTableState, OnChangeFn, RowSelectionState, SortingState, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { footer_height } from "@/components/navs/Footer";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useLongPress } from "../genetics/useLongPress";
import styles from "./styles.module.scss";
import { bgDark, calcColumn, getCommonPinningStyles } from "./utils";

interface IProp<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  columnFilters?: ColumnFiltersState;
  globalFilter?: GlobalFilterTableState;
  setGlobalFilter?: OnChangeFn<GlobalFilterTableState>;
  onRowClick?: (v) => void;
  initSort?: SortingState;
  rowSelection?: RowSelectionState;
  onRowSelect?: OnChangeFn<RowSelectionState>;
  onLongPress?: (event: MouseEvent | TouchEvent) => void;
  estimateSize?: number;
  additionalHeight?: number;
}

export const StackTable = <T extends object>({ estimateSize, columns, data, setColumnFilters, columnFilters, onRowClick, onLongPress, globalFilter, setGlobalFilter, initSort, rowSelection, onRowSelect, additionalHeight }: IProp<T>) => {
  const isMount = useRef(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setHeight] = useState(684);
  const [sorting, setSorting] = useState<SortingState>(initSort ?? []);
  const cols: ColumnDef<T>[] = useMemo<ColumnDef<T, unknown>[]>(() => columns, []);

  const table = useReactTable({
    columns: cols,
    data: data ?? [],
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (c) => {
      const value = table.getCoreRowModel().flatRows[0]?._getAllCellsByColumnId()[c.id]?.getValue() ?? "";

      return typeof value === "string" || typeof value === "number";
    },
    getRowId: (row: any) => row?.id,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: (rowSelection && onRowSelect) || undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (columnFilters && setColumnFilters) || undefined,
    onGlobalFilterChange: (globalFilter && setGlobalFilter) || undefined,
    debugTable: import.meta.env.DEV,
    state: {
      columnFilters,
      globalFilter,
      sorting,
      rowSelection,
    },
  });

  useLayoutEffect(() => {
    if (window && parentRef) {
      const topOffset = parentRef?.current?.getBoundingClientRect().top ?? 0;
      // FIXME можно еще делать вычитание нижнего паддинга от класса .box-main, но он динамический
      setHeight(+(window.innerHeight - topOffset - footer_height - (additionalHeight ?? 0)).toFixed());
    }
  }, [additionalHeight]);

  useEffect(() => {
    isMount.current = true;
  }, []);

  useEffect(() => {
    const trg = table.getAllColumns()[0].id;
    table.getColumn(trg)?.pin("left");
  }, []);

  const { rows } = table.getRowModel();
  const idsRef = rows.map((a) => a.id);
  const memoRows = useMemo(() => rows, [JSON.stringify(idsRef)]);
  const isEmpty = isMount.current && table.options.data.length === 0;
  const isFilteredOut = table.options.data.length > 0 && rows.length === 0;

  const headGroups = table.getHeaderGroups();

  return (
    <div className={styles.cont} style={{ height: `${tableHeight}px` }} ref={parentRef}>
      <table className={styles.table}>
        {headGroups[0]?.headers.length <= 1 ? null : (
          <thead style={{ background: "#1c1c1c" }}>
            {headGroups.map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return header.column.columnDef.header ? (
                      <th key={header.id} style={{ ...calcColumn(header as any), ...getCommonPinningStyles(header.column), minWidth: header.column.columnDef.minSize, background: header.column.getIsPinned() ? bgDark : "#1c1c1c" }}>
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
                    ) : null;
                  })}
                </tr>
              );
            })}
          </thead>
        )}
        <TableVirtual rows={memoRows} estimateSize={estimateSize} contRef={parentRef} isEmpty={isEmpty} isFilteredOut={isFilteredOut} onLongPress={onLongPress} onRowClick={onRowClick} />
      </table>
    </div>
  );
};

export const TableVirtual = memo(({ isEmpty, isFilteredOut, onLongPress, rows, contRef, estimateSize, onRowClick }: any) => {
  const handleLong = useLongPress((e) => onLongPress?.(e));

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => contRef.current,
    estimateSize: () => estimateSize,
    measureElement: typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1 ? (element) => element?.getBoundingClientRect().height : undefined,
    overscan: 5,
    horizontal: false,
  });

  return (
    <tbody
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
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
        virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <tr
              data-index={virtualRow.index}
              key={row.id}
              ref={(node) => virtualizer.measureElement(node)}
              onClick={() => onRowClick?.((row.original as any).id)}
              {...(onLongPress ? handleLong : {})}
              style={{
                // height: `${virtualRow.size}px`, // плохо работает с динамич высотой
                position: "absolute",
                // transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`, // плохо работает с динамич высотой
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={onRowClick != null ? styles.pointer : ""}
            >
              {row.getVisibleCells().map((cell) => {
                return cell.column.columnDef.cell ? (
                  <td key={cell.id} style={{ ...calcColumn(cell), ...getCommonPinningStyles(cell.column), minWidth: cell.column.columnDef.minSize, background: cell.column.getIsPinned() ? bgDark : "transparent" }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ) : null;
              })}
            </tr>
          );
        })
      )}
    </tbody>
  );
});

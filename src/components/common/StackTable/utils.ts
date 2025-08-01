import { CSSProperties } from "preact/compat";
import { StateUpdater } from "preact/hooks";
import { darken } from "@mantine/core";
import { Cell, Column } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";

export const bgDark = darken("var(--mantine-color-dark-4)", 0.5);

export const tableFiltMulti = (handler: (value: StateUpdater<any[]>) => void, a: string[], accessor: string) => {
  handler((s) => {
    let copy = [...s.filter((c) => c.id !== accessor)];
    if (isEmpty(a)) {
      return copy;
    }
    copy.push({ id: accessor, value: a });
    return copy;
  });
};

export const calcColumn = <T>(header: Cell<T, unknown>): CSSProperties => ({ gridColumn: `${header.column.columnDef.size} / span ${header.column.columnDef.maxSize}` });

export const getCommonPinningStyles = <T>(column: Column<T>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: isLastLeftPinnedColumn ? "4px 0px 7px 0px rgba(20, 20, 20, 1)" : isFirstRightPinnedColumn ? "4px 0px -7px 0px rgba(20, 20, 20, 1)" : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 1 : 0,
  };
};

import { CSSProperties } from "preact/compat";
import { StateUpdater } from "preact/hooks";
import { Cell } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";

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

const msToCol = {
  none: "auto",
  "max-content": "max-content",
  "min-content": "min-content",
};

export const calcGridLayout = <T>(headers: Cell<T, unknown>[]): string => {
  return headers
    .map((h) => {
      const min = h.column.columnDef.size;
      const max = h.column.columnDef.maxSize;

      return min?.toString() !== "auto" ? `minmax(${min}px, ${(max && msToCol[max.toString()]) ?? `${max}px`})` : "1fr";
    })
    .join(" ");
};

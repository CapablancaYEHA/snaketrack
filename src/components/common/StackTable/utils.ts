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

export const calcColumn = <T>(header: Cell<T, unknown>): CSSProperties => ({ gridColumn: `${header.column.columnDef.size} / span ${header.column.columnDef.maxSize}` });

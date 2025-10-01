import { StateUpdater } from "preact/hooks";
import { Row } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import { IResSnakesList } from "@/api/common";
import { isOlderThan, isYoungerThan } from "@/utils/time";

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

export const tableFiltSingle = (handler: (value: StateUpdater<any[]>) => void, a: string, accessor: string) => {
  handler((s) => {
    let copy = [...s.filter((c) => c.id !== accessor)];
    if (isEmpty(a)) {
      return copy;
    }
    copy.push({ id: accessor, value: a });
    return copy;
  });
};

export const hatchFiltFn = (row: Row<IResSnakesList>, columnId: string, filterValue: any[]) => {
  const younger: number[] = [];
  const older: number[] = [];
  filterValue.forEach((a) => {
    const [direction, val] = a.split("_");
    if (["older"].includes(direction)) {
      older.push(parseInt(val, 10));
    } else {
      younger.push(parseInt(val, 10));
    }
  });
  const brth = row.original.date_hatch;
  if (!isEmpty(younger) && !isEmpty(older)) {
    return younger.every((y) => isYoungerThan(brth, y)) && older.every((o) => isOlderThan(brth, o));
  }
  if (!isEmpty(younger) && isEmpty(older)) {
    return younger.every((y) => isYoungerThan(brth, y));
  }
  if (isEmpty(younger) && !isEmpty(older)) {
    return older.every((o) => isOlderThan(brth, o));
  }
  if (isEmpty(younger) && isEmpty(older)) {
    return true;
  }
  return false;
};

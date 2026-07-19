import { Row, createColumnHelper } from "@tanstack/react-table";
import { EClSt, IHatchling, IResClutch } from "@/api/breeding/models";
import { dateToSupabaseTime, getDateObj, getStartOf, isInRange } from "@/utils/time";
import { SInfo, SParents } from "./subcomponents";

const columnHelper = createColumnHelper<IResClutch>();

export const defaultRange: any = [dateToSupabaseTime(getStartOf(new Date(), "year")), dateToSupabaseTime(new Date())];

export const rangeFunc = (row: Row<IResClutch>, columnId: string, filterValue: any[]) => {
  if (filterValue.every((a) => a == null)) return true;
  const trg = row.original.date_laid;
  const [start, end] = filterValue;
  return isInRange(trg, [start, end]);
};

export const makeClutchColumns = ({ setSnake, category }) => [
  columnHelper.accessor("date_laid" as any, {
    header: () => "Дата отсчета",
    cell: ({ row }) => <SParents clutch={row.original} onPicClick={setSnake} />,
    size: 1,
    maxSize: 2,
    minSize: 176,
    filterFn: rangeFunc,
    sortingFn: (rowA: any, rowB: any, columnId: any) => getDateObj(rowA.getValue("date_laid")) - getDateObj(rowB.getValue("date_laid")),
  }),
  columnHelper.display({
    id: "whole2",
    cell: ({ row }) => <SInfo clutch={row.original} category={category} />,
    size: 3,
    maxSize: 9,
    minSize: 500,
  }),
];

export const makeHatchlingPlaceholder = ({ id, ind, date }): IHatchling => {
  return {
    snake_name: `${id}_${ind + 1}`,
    date_hatch: date,
    sex: null,
    status: "collection",
    genes: [{ label: "Normal", gene: "other", hasSuper: false, hasHet: false, id: -1 }],
  };
};

export const calcAnim = (stat: EClSt, left: number) => {
  if (stat !== EClSt.LA) return false;
  return left > 0;
};

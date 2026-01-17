import { createColumnHelper } from "@tanstack/react-table";
import { EClSt, IHatchling, IResClutch } from "@/api/breeding/models";
import { getDateObj } from "@/utils/time";
import { SInfo, SPics } from "./subcomponents";

const columnHelper = createColumnHelper<IResClutch>();

export const makeClutchColumns = ({ setSnake, category }) => [
  columnHelper.accessor("date_laid" as any, {
    header: () => "Дата кладки",
    cell: ({ row }) => <SPics clutch={row.original} onPicClick={setSnake} />,
    size: 1,
    maxSize: 2,
    minSize: 176,
    sortingFn: (rowA: any, rowB: any, columnId: any) => getDateObj(rowA.getValue("date_laid")) - getDateObj(rowB.getValue("date_laid")),
  }),
  columnHelper.display({
    id: "whole2",
    cell: ({ row }) => <SInfo clutch={row.original} onPicClick={setSnake} category={category} />,
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

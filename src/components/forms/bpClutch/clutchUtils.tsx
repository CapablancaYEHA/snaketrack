import { createColumnHelper } from "@tanstack/react-table";
import { EClSt, IHatchling, IResBpClutch } from "@/api/models";
import { SClutchCard } from "./subcomponents";

const columnHelper = createColumnHelper<IResBpClutch>();

export const makeBpClutchColumns = ({ setSnake }) => [
  columnHelper.display({
    id: "whole",
    cell: ({ row }) => <SClutchCard clutch={row.original} onPicClick={setSnake} />,
    size: 1,
    maxSize: 12,
  }),
];

export const makeHatchlingPlaceholder = ({ id, ind, date }): IHatchling => {
  return {
    snake_name: `${id}_${ind + 1}`,
    date_hatch: date,
    sex: null,
    status: "alive",
    genes: [{ label: "Normal", gene: "other", hasSuper: false, hasHet: false }],
  };
};

export const calcAnim = (stat: EClSt, left: number) => {
  if (stat !== EClSt.LA) return false;
  return left > 0;
};

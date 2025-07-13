import { createColumnHelper } from "@tanstack/react-table";
import { IResBpClutch } from "@/api/models";
import { SCard } from "./subcomponents";

const columnHelper = createColumnHelper<IResBpClutch>();

export const makeBpClutchColumns = ({ setSnake }) => [
  columnHelper.display({
    id: "whole",
    cell: ({ row }) => <SCard clutch={row.original} onPicClick={setSnake} />,
    size: 1,
    maxSize: 12,
  }),
];

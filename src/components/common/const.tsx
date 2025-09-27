import fallback from "@assets/placeholder.png";
import { Image, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IResSnakesList } from "@/api/common";
import { getAge } from "@/utils/time";
import { Controls, GenesList, SnakeEventsBlock } from "../common/SnakeCard";
import { SexName } from "../common/sexName";
import { hatchFiltFn } from "./StackTable/filters";

const colHelper = createColumnHelper<IResSnakesList>();

export const makeListColumns = ({ openTrans, openFeed, openDelete, category }) => {
  return [
    colHelper.accessor("picture", {
      header: () => " ",
      cell: ({ cell, row }) => (
        <Controls id={row.original.id} openTrans={openTrans} openFeed={openFeed} openDelete={openDelete} category={category}>
          <Stack gap="xs" flex="1 1 140px">
            <Image src={cell.getValue() ?? fallback} flex="1 1 0px" fit="cover" radius="md" w="auto" maw="100%" h={110} fallbackSrc={fallback} loading="lazy" />
            <SexName sex={row.original.sex} name={row.original.snake_name} size="md" />
          </Stack>
        </Controls>
      ),
      enableSorting: false,
      size: 1,
      maxSize: 3,
      minSize: 140,
    }),
    colHelper.accessor((row: any) => row.snake_name, {
      id: "names",
      header: undefined,
      cell: undefined,
    }),
    colHelper.accessor((row: any) => row.sex, {
      id: "sex",
      header: undefined,
      cell: undefined,
      filterFn: (row: any, columnId, filterValue) => (!filterValue[0] ? true : filterValue.includes(row.original.sex)),
    }),
    colHelper.accessor("feeding", {
      header: () => "События",
      cell: ({ cell, row }) => <SnakeEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} />,
      enableSorting: false,
      size: 4,
      maxSize: 2,
      minSize: 150,
    }),
    colHelper.accessor("date_hatch", {
      header: () => "Возраст",
      cell: ({ cell }) => <Text size="sm">{getAge(cell.getValue())}</Text>,
      size: 6,
      maxSize: 2,
      minSize: 150,
      filterFn: hatchFiltFn,
    }),
    colHelper.accessor("genes", {
      header: () => "Гены",
      cell: ({ cell }) => <GenesList genes={cell.getValue()} />,
      size: 8,
      maxSize: 5,
      minSize: 200,
      filterFn: (row: any, columnId, filterValue) => filterValue.every((a) => row.original.genes.map((b) => b.label).includes(a)),
    }),
  ];
};

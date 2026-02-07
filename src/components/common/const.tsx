import fallback from "@assets/placeholder.webp";
import { AspectRatio, Box, Image, Indicator, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IResSnakesList } from "@/api/common";
import { catVisited } from "@/pages/SnakeCategories";
import { getAge } from "@/utils/time";
import { Controls, GenesList, SnakeEventsBlock } from "../common/SnakeCard";
import { SexName } from "../common/sexName";
import { snakeStatusToColor, snakeStatusToLabel } from "./Market/utils";
import { hatchFiltFn } from "./StackTable/filters";

const colHelper = createColumnHelper<IResSnakesList>();

export const makeListColumns = ({ openTrans, openFeed, openDelete, openTag }) => {
  return [
    colHelper.accessor("picture", {
      header: () => " ",
      cell: ({ cell, row }) => (
        <Controls id={row.original.id} openTrans={openTrans} openFeed={openFeed} openTag={openTag} openDelete={openDelete} category={catVisited.value}>
          <Stack gap="xs" maw="100%" w="100%">
            <SexName sex={row.original.sex} name={row.original.snake_name} size="md" />
            {row.original.tags ? (
              <Text fw={500} size="xs" c="pink">
                {row.original.tags.map((t) => `#${t}`).join(" ")}
              </Text>
            ) : null}
            <AspectRatio ratio={16 / 9} maw="100%">
              <Image src={cell.getValue()} fit="cover" radius="md" w="100%" fallbackSrc={fallback} loading="lazy" />
            </AspectRatio>
            <GenesList genes={row.original.genes} size="xs" />
          </Stack>
        </Controls>
      ),
      enableSorting: false,
      size: 1,
      maxSize: 5,
      minSize: 194,
    }),
    colHelper.accessor((row: any) => row.snake_name, {
      id: "names",
      header: undefined,
      cell: undefined,
      enableSorting: true,
    }),
    colHelper.accessor((row: any) => row.sex, {
      id: "sex",
      header: undefined,
      cell: undefined,
      enableColumnFilter: true,
      filterFn: "equals",
    }),
    colHelper.accessor((row: any) => row.notes, {
      id: "notes",
      header: undefined,
      cell: undefined,
    }),
    colHelper.accessor("feeding", {
      header: () => "События",
      cell: ({ cell, row }) => <SnakeEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} />,
      enableSorting: false,
      size: 6,
      maxSize: 3,
      minSize: 150,
    }),
    colHelper.accessor("date_hatch", {
      header: () => "Возраст",
      cell: ({ cell }) => <Text size="sm">{getAge(cell.getValue())}</Text>,
      size: 9,
      maxSize: 3,
      minSize: 150,
      filterFn: hatchFiltFn,
    }),
    colHelper.accessor((row: any) => row.tags, {
      id: "tags",
      header: undefined,
      cell: undefined,
      enableSorting: false,
      filterFn: (row: any, columnId, filterValue) => filterValue.every((a) => (row.original.tags ?? []).includes(a)),
    }),
    colHelper.accessor((row: any) => row.genes, {
      id: "genes",
      header: undefined,
      cell: undefined,
      enableSorting: false,
      filterFn: (row: any, columnId, filterValue) => filterValue.every((a) => row.original.genes.map((b) => b.label).includes(a)),
    }),
    colHelper.accessor("status", {
      header: () => "Статус",
      cell: ({ cell }) => (
        <Indicator position="middle-start" inline size={8} color={snakeStatusToColor[cell.getValue()]} processing zIndex={3}>
          <Box>
            <Text fw={500} size="xs" ml="sm">
              {snakeStatusToLabel[cell.getValue()]}
            </Text>
          </Box>
        </Indicator>
      ),
      size: 12,
      maxSize: 1,
      minSize: 98,
      enableSorting: false,
    }),
  ];
};

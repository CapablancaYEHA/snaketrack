import fallback from "@assets/placeholder.png";
import { AspectRatio, Box, Flex, Image, Indicator, NumberFormatter, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { IMarketRes } from "@/api/common";
import { getAge } from "@/utils/time";
import { GenesList } from "../SnakeCard";
import { MarketControls } from "./marketControls";

const columnHelper = createColumnHelper<IMarketRes>();

export const marketColumns = [
  columnHelper.accessor("pictures", {
    header: () => " ",
    cell: ({ cell, row }) => (
      <MarketControls id={row.original.id} owner={row.original.owner_id} cat={row.original.category}>
        <Stack gap="xs" maw="100%" w="100%">
          <AspectRatio ratio={16 / 9}>
            <Image src={cell.getValue()[0]} fit="cover" radius="md" h="auto" fallbackSrc={fallback} loading="lazy" />
          </AspectRatio>
          <Flex align="center" gap="xs">
            <IconSwitch icon={row.original.sex as any} width="20" height="20" style={{ minWidth: 0 }} />
            <Text size="xs">'{getAge(row.original.date_hatch)}</Text>
          </Flex>
          <Box ml="auto">
            <Text fw={500}>
              <NumberFormatter prefix="₽ " value={row.original.sale_price} thousandSeparator=" " />
            </Text>
          </Box>
        </Stack>
      </MarketControls>
    ),
    enableSorting: false,
    size: 1,
    maxSize: 4,
    minSize: 200,
  }),
  columnHelper.accessor("genes", {
    header: () => "Гены",
    cell: ({ cell }) => <GenesList genes={cell.getValue()} />,
    size: 5,
    maxSize: 4,
    minSize: 200,
    enableSorting: false,
  }),
  columnHelper.accessor("city_name", {
    header: () => "Город",
    cell: ({ cell }) => (
      <Text fw={400} size="xs">
        {cell.getValue()}
      </Text>
    ),
    size: 10,
    maxSize: 1,
    minSize: 200,
    enableSorting: false,
  }),
  columnHelper.accessor("status", {
    header: () => "Статус",
    cell: ({ cell }) => (
      <Indicator position="middle-start" inline size={8} color={snakeStatusToColor[cell.getValue()]} processing>
        <Box>
          <Text fw={500} size="xs" ml="sm">
            {snakeStatusToLabel[cell.getValue()]}
          </Text>
        </Box>
      </Indicator>
    ),
    size: 11,
    maxSize: 2,
    minSize: 98,
    enableSorting: false,
  }),
];

export const snakeStatusToColor = {
  collection: "#9382ff",
  isolation: "#ff95ed",
  on_sale: "#2ebc7b",
  sold: "#af2e2e",
  reserved: "#ffd74a",
  deceased: "#c4c4c4",
  archived: "#ff7c42",
};

export const snakeStatusToLabel = {
  collection: "Коллекция",
  isolation: "Карантин",
  on_sale: "В продаже",
  sold: "Продан",
  reserved: "Бронь",
  deceased: "Умер",
  archived: "Архив",
};

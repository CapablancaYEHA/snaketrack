import fallback from "@assets/placeholder.webp";
import { AspectRatio, Box, Flex, Image, Indicator, NumberFormatter, Stack, Text, darken } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { IMarketRes } from "@/api/common";
import { dateTimeDiff, getAge } from "@/utils/time";
import { GenesList } from "../SnakeCard";
import { MarketControls } from "./marketControls";

const columnHelper = createColumnHelper<IMarketRes>();

export const marketColumns = [
  columnHelper.accessor("pictures", {
    header: () => " ",
    cell: ({ cell, row }) => {
      const isShowDiscount = row.original.discount_price && row.original.discount_until ? dateTimeDiff(row.original.discount_until, "date") > 0 : row.original.discount_price && !row.original.discount_until ? row.original.discount_price : false;
      return (
        <MarketControls id={row.original.id} owner={row.original.owner_id} cat={row.original.category}>
          <Stack gap="xs" maw="100%" w="100%" pos="relative">
            <AspectRatio ratio={16 / 9}>
              <Image src={cell.getValue()[0]} fit="cover" radius="md" h="auto" fallbackSrc={fallback} loading="lazy" />
            </AspectRatio>
            {row.original.status !== "on_sale" ? (
              <Box pos="absolute" bg={darken("var(--mantine-color-dark-4)", 0.5)} right={8} top={8} pr="xs" pl="sm" style={{ borderRadius: 4 }}>
                <Indicator position="middle-start" inline size={8} color={snakeStatusToColor[row.original.status]} processing zIndex={3}>
                  <Box>
                    <Text fw={500} size="xs" ml="sm">
                      {snakeStatusToLabel[row.original.status]}
                    </Text>
                  </Box>
                </Indicator>
              </Box>
            ) : null}
            <Flex align="center" gap="xs">
              <IconSwitch icon={row.original.sex as any} width="20" height="20" style={{ minWidth: 0 }} />
              <Text size="xs">'{getAge(row.original.date_hatch)}</Text>
            </Flex>
            <Flex ml="auto" gap="xs" align="baseline">
              {isShowDiscount ? (
                <>
                  <Text fw={500} size="xs" c="dark.3">
                    <s>
                      <NumberFormatter prefix="₽ " value={row.original.sale_price} thousandSeparator=" " />
                    </s>
                  </Text>
                  <Text fw={500}>
                    <NumberFormatter prefix="₽ " value={row.original.discount_price!} thousandSeparator=" " />
                  </Text>
                </>
              ) : (
                <Text fw={500}>
                  <NumberFormatter prefix="₽ " value={row.original.sale_price} thousandSeparator=" " />
                </Text>
              )}
            </Flex>
          </Stack>
        </MarketControls>
      );
    },
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
  columnHelper.accessor("username", {
    header: () => "Продавец",
    cell: ({ cell }) => (
      <Text fw={500} size="xs">
        {cell.getValue()}
      </Text>
    ),
    size: 11,
    maxSize: 1,
    minSize: 140,
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

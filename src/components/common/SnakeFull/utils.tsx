import { Flex, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IFeed } from "@/api/common";
import { getDateShort } from "@/utils/time";
import { codeToFeeder } from "../Feeder/const";

const columnHelper = createColumnHelper<IFeed>();

export const snakeFeedColumns = [
  columnHelper.accessor("feed_last_at", {
    header: () => "Дата",
    cell: ({ cell }) => getDateShort(cell.getValue()!),
    size: 1,
    maxSize: 1,
    minSize: 82,
  }),
  columnHelper.accessor("feed_ko", {
    header: () => "КО / Проблема",
    cell: ({ row, cell }) => {
      const res = codeToFeeder(cell.getValue() as any);
      return row.original.regurgitation ? (
        <Flex gap="xs" wrap="wrap">
          <Text fw={500} component="span" c="var(--mantine-color-error)">
            Срыг{" "}
          </Text>
          {res ? (
            <Text component="span" size="xs" style={{ alignSelf: "center" }}>
              {res}
            </Text>
          ) : null}
        </Flex>
      ) : row.original.refuse ? (
        <Flex gap="xs" wrap="wrap">
          <Text fw={500} component="span" c="#00FFC0">
            Отказ{" "}
          </Text>
          {res ? (
            <Text component="span" size="xs" style={{ alignSelf: "center" }}>
              {res}
            </Text>
          ) : null}
        </Flex>
      ) : cell.getValue() != null ? (
        codeToFeeder(cell.getValue()!)
      ) : (
        "—"
      );
    },
    enableSorting: false,
    size: 2,
    maxSize: 4,
    minSize: 200,
  }),
  columnHelper.accessor("feed_weight" as any, {
    header: () => "Вес КО",
    cell: ({ cell }) => cell.getValue() || "—",
    size: 7,
    maxSize: 2,
    minSize: 88,
  }),
  columnHelper.accessor("feed_comment", {
    header: () => "Коммент",
    size: 9,
    maxSize: 13,
    minSize: 168,
  }),
];

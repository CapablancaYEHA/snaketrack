import fallback from "@assets/placeholder.png";
import { Checkbox, Flex, Image, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import { BpEventsBlock } from "@/components/ballpythons/BpCard";
import { SexName } from "@/components/common/sexName";
import { IRemindersRes, IResSnakesList } from "@/api/models";
import { getAge } from "@/utils/time";

const columnHelper = createColumnHelper<IResSnakesList>();

export const makeScheduleColumns = () => [
  columnHelper.accessor("picture", {
    header: () => "Региус",
    cell: ({ cell, row }) => (
      <Flex gap="sm">
        <Checkbox
          size="xs"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={() => {
            const sel = row.getIsSelected();
            row.toggleSelected(!sel);
          }}
        />
        <Stack gap="xs" flex="1 1 auto">
          <Image src={cell.getValue()} fit="cover" radius="sm" w="100%" loading="lazy" mah={110} flex="1 1 0px" fallbackSrc={fallback} />
          <SexName sex={row.original.sex} name={row.original.snake_name} size="sm" />
        </Stack>
      </Flex>
    ),
    size: 1,
    maxSize: 3,
    minSize: 190,
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("feeding", {
    header: () => "События",
    cell: ({ cell, row }) => <BpEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} isShowShed={false} isShowWeight={false} />,
    enableSorting: false,
    enableColumnFilter: false,
    size: 4,
    maxSize: 9,
    minSize: 150,
  }),
];

export const getSnakesInReminder = (a: IRemindersRes | undefined, snakes: IResSnakesList[]) => {
  return !a ? null : snakes.filter((s) => a.snake_ids?.includes(s.id));
};

export const makeSubmit = (selection: string[], existing: string[] | undefined | null) => {
  let newIds: string[] = [];
  // массив для айди которые уже есть в текущем напоминаии
  const dubl: string[] = [];

  if (!existing || isEmpty(existing)) {
    newIds = selection;
  } else {
    selection.forEach((a) => {
      if (existing.includes(a)) {
        dubl.push(a);
      } else {
        newIds.push(a);
      }
    });
  }
  return { forUpdate: dubl, forCreate: newIds };
};

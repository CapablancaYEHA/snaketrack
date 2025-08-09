import fallback from "@assets/placeholder.png";
import { Checkbox, Image, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import { BpEventsBlock } from "@/components/ballpythons/BpCard";
import { SexName } from "@/components/common/sexName";
import { IRemindersRes, IResSnakesList } from "@/api/models";
import { getAge } from "@/utils/time";

const columnHelper = createColumnHelper<IResSnakesList>();

export const makeScheduleColumns = () => [
  columnHelper.display({
    id: "checkbox_column",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={() => {
          const sel = row.getIsSelected();
          row.toggleSelected(!sel);
        }}
      />
    ),
    size: 1,
    maxSize: 1,
    minSize: 36,
  }),
  columnHelper.accessor("picture", {
    header: () => "Региус",
    cell: ({ cell, row }) => (
      <Stack gap="xs" flex="1 1 auto">
        <Image src={cell.getValue()} fit="cover" radius="sm" w="auto" h={64} loading="lazy" flex="1 1 64px" fallbackSrc={fallback} />
        <SexName sex={row.original.sex} name={row.original.snake_name} size="md" />
      </Stack>
    ),
    size: 2,
    maxSize: 3,
    minSize: 94,
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("date_hatch", {
    header: () => " ",
    cell: ({ cell }) => <Text size="md">⌛ {getAge(cell.getValue())}</Text>,
    size: 5,
    maxSize: 2,
    minSize: 150,
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("feeding", {
    header: () => "События",
    cell: ({ cell, row }) => <BpEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} isShowShed={false} isShowWeight={false} />,
    enableSorting: false,
    enableColumnFilter: false,
    size: 7,
    maxSize: 6,
    minSize: 150,
  }),
];

export const calcExisting = (a: IRemindersRes | undefined, snakes: IResSnakesList[]) => {
  return !a ? null : a.snake_ids?.map((s) => snakes.find((k) => k.id === s));
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

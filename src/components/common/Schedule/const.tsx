import fallback from "@assets/placeholder.png";
import { Checkbox, Flex, Image, Stack } from "@mantine/core";
import { signal } from "@preact/signals";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import { SexName } from "@/components/common/sexName";
import { ECategories, IRemResExt, IRemindersRes, IResSnakesList } from "@/api/common";
import { SnakeEventsBlock } from "../SnakeCard";
import { RemControls } from "./remControls";

export const snakesWithRems = signal<string[]>([]);
const columnHelper = createColumnHelper<IResSnakesList>();

export const makeScheduleColumns = ({ openFeed }) => [
  columnHelper.accessor("picture", {
    header: () => "Змея",
    cell: ({ cell, row }) => (
      <Flex gap="sm" w="100%">
        <Checkbox
          size="sm"
          checked={snakesWithRems.value?.includes(row.original.id) || row.getIsSelected()}
          disabled={snakesWithRems.value?.includes(row.original.id) || !row.getCanSelect()}
          onChange={() => {
            const sel = row.getIsSelected();
            row.toggleSelected(!sel);
          }}
          style={{ alignSelf: "start" }}
        />
        <RemControls id={row.original.id} openFeed={openFeed}>
          <Stack gap="xs" flex="1 1 auto">
            <Image src={cell.getValue()} fit="cover" radius="sm" w="100%" loading="lazy" mah={72} flex="1 1 0px" fallbackSrc={fallback} />
            <SexName sex={row.original.sex} name={row.original.snake_name} size="sm" />
          </Stack>
        </RemControls>
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
    cell: ({ cell, row }) => <SnakeEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} isShowShed={false} />,
    enableSorting: false,
    enableColumnFilter: false,
    size: 4,
    maxSize: 9,
    minSize: 150,
  }),
  columnHelper.accessor((row: any) => row.snake_name, {
    id: "names",
    header: undefined,
    cell: undefined,
    enableSorting: true,
  }),
];

export const getSnakesInReminder = (a: IRemindersRes | undefined, snakes: IResSnakesList[]) => {
  return !a ? null : snakes.filter((s) => a.snake?.includes(s.id));
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

type ICst = {
  [key in ECategories]?: string[];
};

export const composeSnakesType = (dt: IRemResExt[]) => {
  let res: ICst = {};

  if (isEmpty(dt)) return {};

  for (let sn of dt) {
    if (res.hasOwnProperty(sn.category)) {
      res[sn.category]!.push(sn.snake);
    } else {
      res[sn.category] = [sn.snake];
    }
  }

  return res;
};

export const listReminderContents = (categories: ECategories[], remsThisDate?: IRemResExt[]) => categories.map((categ) => remsThisDate?.filter((b) => b.category === categ));

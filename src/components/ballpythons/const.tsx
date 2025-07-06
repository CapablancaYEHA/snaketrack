import fallback from "@assets/placeholder.png";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import { Row, createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import { EBreedStat, IFeed, IGenesBpComp, IResBpBreedingList, IResSnakesList } from "@/api/models";
import { getAge, getDateShort, isOlderThan, isYoungerThan } from "@/utils/time";
import { SexName } from "../common/sexName";
import { feederToString } from "../forms/addBp/const";
import { BpControls, BpEventsBlock, BpGenes } from "./BpCard";

const columnHelper = createColumnHelper<IFeed>();
const colHelper = createColumnHelper<IResSnakesList>();

export const bpFeedColumns = [
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
      const res = feederToString[cell.getValue() as any];
      return row.original.regurgitation ? (
        <Flex gap="md" wrap="wrap">
          <Text fw={500} component="span" c="var(--mantine-color-error)">
            Срыг{" "}
          </Text>
          {res ? (
            <Text component="span" size="xs" style={{ alignSelf: "center", whiteSpace: "nowrap" }}>
              {res}
            </Text>
          ) : null}
        </Flex>
      ) : row.original.refuse ? (
        <Flex gap="md" wrap="wrap">
          <Text fw={500} component="span" c="#00FFC0">
            Отказ{" "}
          </Text>
          {res ? (
            <Text component="span" size="xs" style={{ alignSelf: "center", whiteSpace: "nowrap" }}>
              {res}
            </Text>
          ) : null}
        </Flex>
      ) : cell.getValue() != null ? (
        feederToString[cell.getValue()!]
      ) : (
        ""
      );
    },
    enableSorting: false,
    size: 2,
    maxSize: 4,
    minSize: 200,
  }),
  columnHelper.accessor("feed_weight" as any, {
    header: () => "Вес КО",
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

const hatchFIltFn = (row: Row<IResSnakesList>, columnId: string, filterValue: any[]) => {
  const younger: number[] = [];
  const older: number[] = [];
  filterValue.forEach((a) => {
    const [direction, val] = a.split("_");
    if (["older"].includes(direction)) {
      older.push(parseInt(val, 10));
    } else {
      younger.push(parseInt(val, 10));
    }
  });
  const brth = row.original.date_hatch;
  if (!isEmpty(younger) && !isEmpty(older)) {
    return younger.every((y) => isYoungerThan(brth, y)) && older.every((o) => isOlderThan(brth, o));
  }
  if (!isEmpty(younger) && isEmpty(older)) {
    return younger.every((y) => isYoungerThan(brth, y));
  }
  if (isEmpty(younger) && !isEmpty(older)) {
    return older.every((o) => isOlderThan(brth, o));
  }
  if (isEmpty(younger) && isEmpty(older)) {
    return true;
  }
  return false;
};

export const makeBpCardColumns = ({ openTrans, openFeed }) => {
  return [
    colHelper.accessor("picture", {
      header: () => " ",
      cell: ({ cell, row }) => (
        <Stack gap="xs" flex="1 1 140px">
          <Image src={cell.getValue() ?? fallback} flex="1 1 0px" fit="cover" radius="md" w="auto" maw="100%" h={110} fallbackSrc={fallback} loading="lazy" />
          <SexName sex={row.original.sex} name={row.original.snake_name} size="md" />
        </Stack>
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
    colHelper.accessor("date_hatch", {
      header: () => "Возраст",
      cell: ({ cell }) => <Text size="md">{getAge(cell.getValue())}</Text>,
      size: 4,
      maxSize: 2,
      minSize: 150,
      filterFn: hatchFIltFn,
    }),
    colHelper.accessor("feeding", {
      header: () => "События",
      cell: ({ cell, row }) => <BpEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} />,
      enableSorting: false,
      size: 6,
      maxSize: 2,
      minSize: 150,
    }),
    colHelper.accessor("genes", {
      header: () => "Гены",
      cell: ({ cell }) => <BpGenes genes={cell.getValue()} />,
      size: 8,
      maxSize: 4,
      minSize: 200,
      filterFn: (row: any, columnId, filterValue) => filterValue.every((a) => row.original.genes.map((b) => b.label).includes(a)),
    }),
    colHelper.display({
      id: "action",
      cell: ({ row }) => <BpControls id={row.original.id} openTrans={openTrans} openFeed={openFeed} />,
      size: 12,
      maxSize: 1,
      minSize: 36,
    }),
  ];
};

export const detailsDict = [
  { label: "Год", value: "years" },
  { label: "Сезон", value: "seasons" },
  { label: "Квартал", value: "quarters" },
  { label: "Месяц", value: "months" },
  { label: "Неделя", value: "weeks" },
];

export const subjectDict = [
  { label: "Кормления", value: "ko" },
  { label: "Вес", value: "snake" },
  { label: "Вес и Кормления", value: "both" },
];

export const calcProjGenes = (arr?: IGenesBpComp[]) => {
  if (!arr) return [];
  const pre = arr
    .filter((g) => g.label !== "Normal")
    .map((a) => {
      if (a.gene === "inc-dom") {
        const [r, ..._] = a.label.match(/(Super)?\w+$/)!;
        return { gene: "inc-dom", label: r };
      }
      if (a.gene === "rec") {
        const [, , , r, ..._] = a.label.match(/^((\d+)% Het |Het )?(\w+)$/)!;

        return { gene: "rec", label: r };
      }
      return a;
    });
  return [...new Set(pre)];
};

export const calcBreedTraits = (all: IResBpBreedingList[] | undefined) => {
  if (!all) return [];
  let res = all.map((a) => a.female_genes.concat(a.male_genes.flat())).flat();
  let resmore = calcProjGenes(res).map((a) => a.label);
  return [...new Set(resmore)];
};

export const bStToLabel = {
  [EBreedStat.PLAN]: "Планирование",
  [EBreedStat.WOO]: "Ухаживание",
  [EBreedStat.LOCK]: "Лок",
  [EBreedStat.OVUL]: "Овуляция",
  [EBreedStat.SHED]: "Предродовая линька",
  [EBreedStat.CLUTCH]: "Кладка",
};

export const breedToColor = {
  [EBreedStat.PLAN]: "#2E5A88",
  [EBreedStat.WOO]: "#FFB6C1",
  [EBreedStat.LOCK]: "#8B0000",
  [EBreedStat.OVUL]: "#FFDAB9",
  [EBreedStat.SHED]: "#4E9525",
  [EBreedStat.CLUTCH]: "#F5F5DC",
};

export const calcStatusOptions = () => Object.entries(bStToLabel).map(([key, val]) => ({ label: val, value: key }));

export const maturityDict = [
  {
    label: "Младше 2 месяцев",
    value: "younger_2",
  },
  {
    label: "Младше полугода",
    value: "younger_6",
  },
  {
    label: "Младше года",
    value: "younger_12",
  },
  {
    label: "Младше 2-х лет",
    value: "younger_24",
  },
  {
    label: "Старше полугода",
    value: "older_6",
  },
  {
    label: "Старше года",
    value: "older_12",
  },
  {
    label: "Старше 2-х лет",
    value: "older_24",
  },
  {
    label: "Старше 3-х лет",
    value: "older_36",
  },
];

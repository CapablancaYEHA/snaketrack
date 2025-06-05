import fallback from "@assets/placeholder.png";
import { Image, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IFeed, IGenesBpComp, IResBpBreedingList, IResSnakesList } from "@/api/models";
import { getAge, getDateShort } from "@/utils/time";
import { SexName } from "../common/sexName";
import { feederToString } from "../forms/addBp/const";
import { BpControls, BpEventsBlock, BpGenes } from "./BpCard";

const columnHelper = createColumnHelper<IFeed>();
const colHelper = createColumnHelper<IResSnakesList>();

export const bpFeedColumns = [
  columnHelper.accessor("feed_last_at", {
    header: () => "Дата",
    cell: ({ cell }) => getDateShort(cell.getValue()!),
    size: 100,
    maxSize: "none" as unknown as number,
  }),
  columnHelper.accessor("feed_ko", {
    header: () => "КО / Проблема",
    cell: ({ row, cell }) =>
      row.original.regurgitation ? (
        <Text fw={500} component="span" c="var(--mantine-color-error)">
          Срыг
        </Text>
      ) : row.original.refuse ? (
        <Text fw={500} component="span" c="#00FFC0">
          Отказ
        </Text>
      ) : cell.getValue() != null ? (
        feederToString[cell.getValue()!]
      ) : (
        ""
      ),
    enableSorting: false,
    size: 160,
    maxSize: "none" as unknown as number,
  }),
  columnHelper.accessor("feed_weight" as any, {
    header: () => "Вес КО",
    size: 80,
    maxSize: "none" as unknown as number,
  }),
  columnHelper.accessor("feed_comment", {
    header: () => "Коммент",
    size: "auto" as unknown as number,
    maxSize: "none" as unknown as number,
  }),
];

export const makeBpCardColumns = ({ openTrans, openFeed }) => {
  return [
    colHelper.accessor("picture", {
      header: () => " ",
      cell: ({ cell, row }) => (
        <Stack gap="xs" flex="0 0 196px">
          <Image src={cell.getValue()} fit="cover" radius="md" w="auto" maw="fit-content" h={110} fallbackSrc={fallback} loading="lazy" />
          <SexName sex={row.original.sex} name={row.original.snake_name} />
        </Stack>
      ),
      enableSorting: false,
      size: 100,
      maxSize: "max-content" as unknown as number,
    }),
    colHelper.accessor("date_hatch", {
      header: () => "Возраст",
      cell: ({ cell }) => <Text size="md">{getAge(cell.getValue())}</Text>,
      size: 100,
      maxSize: 200,
    }),
    colHelper.accessor("feeding", {
      header: () => "События",
      cell: ({ cell, row }) => <BpEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} />,
      enableSorting: false,
      size: 100,
      maxSize: "none" as unknown as number,
    }),
    colHelper.accessor("genes", {
      header: () => "Гены",
      cell: ({ cell }) => <BpGenes genes={cell.getValue()} />,
      maxSize: "none" as unknown as number,
    }),
    colHelper.display({
      id: "action",
      cell: ({ row }) => <BpControls id={row.original.id} openTrans={openTrans} openFeed={openFeed} />,
      size: 40,
      maxSize: 40,
    }),
  ];
};

export const detailsDict = [
  { label: "Год", value: "years" },
  { label: "Сезон", value: "seasons" },
  { label: "Квартал", value: "quarters" },
  { label: "Месяц", value: "months" },
  { label: "Неделя", value: "weeks" },
  { label: "День", value: "days" },
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

export const calcTraitsOptions = (all: IResBpBreedingList[] | undefined) => {
  if (!all) return [];
  let res = all.map((a) => a.female_genes.concat(a.male_genes.flat())).flat();
  let resmore = calcProjGenes(res).map((a) => a.label);
  return [...new Set(resmore)];
};

export const bStToLabel = {
  plan: "Планирование",
  woo: "Ухаживание",
  lock: "Лок",
  ovul: "Овуляция",
  shed: "Предродовая линька",
  clutch: "Кладка",
};

export const breedToColor = {
  plan: "#2E5A88",
  woo: "#FFB6C1",
  lock: "#8B0000",
  ovul: "#FFDAB9",
  shed: "#4E9525",
  clutch: "#F5F5DC",
};

export const calcStatusOptions = () => Object.keys(bStToLabel);

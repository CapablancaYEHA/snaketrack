import { Text } from "@mantine/core";
import { IGenesBpComp, IResBpBreedingList } from "@/api/models";
import { getDateShort } from "@/utils/time";
import { feederToString } from "../forms/addBp/const";

export const bpColumns = [
  {
    accessor: "feed_last_at",
    title: "Дата",
    render: ({ feed_last_at }) => getDateShort(feed_last_at),
    sortable: true,
    noWrap: true,
    width: 100,
  },
  {
    accessor: "feed_ko",
    title: "КО / Проблема",
    render: ({ feed_ko, regurgitation, refuse }) => {
      return regurgitation ? (
        <Text fw={500} component="span" c="var(--mantine-color-error)">
          Срыг
        </Text>
      ) : refuse ? (
        <Text fw={500} component="span" c="#00FFC0">
          Отказ
        </Text>
      ) : (
        feederToString[feed_ko]
      );
    },
    sortable: false,
    width: 160,
  },
  {
    accessor: "feed_weight",
    title: "Вес КО",
    sortable: true,
    noWrap: true,
    width: 80,
  },
  {
    accessor: "feed_comment",
    title: "Коммент",
    sortable: true,
  },
];

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

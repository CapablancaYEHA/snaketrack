import { uniqBy } from "lodash-es";
import { bpList, bpSingle } from "@/api/ballpythons/configs";
import { EBreedStat } from "@/api/ballpythons/models";
import { bcList, bcSingle } from "@/api/boa-constrictors/configs";
import { ECategories, IGenesComp } from "@/api/common";
import { csList, csSingle } from "@/api/corn-snakes/configs";

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

export const bStToLabel = {
  [EBreedStat.PLAN]: "Планирование",
  [EBreedStat.WOO]: "Ухаживания",
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

export const categToConfig = {
  [ECategories.BP]: bpSingle,
  [ECategories.BC]: bcSingle,
  [ECategories.CS]: csSingle,
};

export const categToConfigList = {
  [ECategories.BP]: bpList,
  [ECategories.BC]: bcList,
  [ECategories.CS]: csList,
};

export const categToTitle = {
  [ECategories.BP]: "Региус",
  [ECategories.BC]: "Удав",
  [ECategories.CS]: "Маис",
};

export const calcStatusOptions = () => Object.entries(bStToLabel).map(([key, val]) => ({ label: val, value: key }));

export const calcProjGenes = (arr?: IGenesComp[]) => {
  if (!arr) return [];
  const pre = arr
    .filter((g) => g.label !== "Normal")
    .map((a) => {
      if (a.gene === "inc-dom") {
        if (a.label.startsWith("Super")) {
          const [r, ..._] = a.label.match(/(Super)?\w+$/)!;
          return { gene: "inc-dom", label: r, isPos: a.isPos };
        }
        return { gene: "inc-dom", label: a.label, isPos: a.isPos };
      }
      if (a.gene === "rec") {
        const [, , , r, ..._] = a.label.match(/^((\d+)% Het |Het )?([\w\s()]+)$/)!;

        return { gene: "rec", label: r, isPos: a.isPos };
      }
      return a;
    });
  return uniqBy(pre, "label");
};

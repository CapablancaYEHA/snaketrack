import { Flex, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { bStToLabel, breedToColor } from "@/components/common/utils";
import { IResBreedingList } from "@/api/breeding/models";
import { ECategories } from "@/api/common";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff, getDate } from "@/utils/time";
import { GenePill } from "../../../common/genetics/geneSelect";
import { BreedControl } from "./subcomponents";

export const daysAfterOvul = {
  [ECategories.BP]: 44,
  [ECategories.CS]: 30,
  [ECategories.MV]: 89,
};
export const daysAfterShed = {
  [ECategories.BP]: 29,
  [ECategories.CS]: 14,
  [ECategories.MV]: 38,
};
export const daysIncubation = {
  [ECategories.BP]: 60,
  [ECategories.CS]: 65,
  [ECategories.MV]: 54,
};
export const daysCriticalThr = 10;

//   Boa constrictor gestation period is around 120 days. If no babies after 105 days, check for a post-ovulation shed. If it's not, wait longer.
//   Boa constrictors give birth approximately 105 days after postovulatory shedding and approximately 123 days after ovulation
//   In comparing the mean gestation length of primiparous and pluriparous, there were no significant differences.
//   Females considered in our study showed a post-ovulatory shed about three weeks after ovulation.
//   This confirms what is reported in the literature. Indeed, pregnant Boa constrictor females generally exhibit post-ovulatory shed approximately 16–20 days after ovulation

const columnHelper = createColumnHelper<IResBreedingList>();

export const makeBreedColumns = ({ setBreedId, category }) => {
  return [
    columnHelper.accessor("female_name", {
      header: () => "Самка",
      cell: ({ cell, row }) => (
        <BreedControl id={row.original.id} onDelete={setBreedId} clutchId={row.original.clutch_id} category={category}>
          <Text maw="100%" w="100%" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {cell.getValue()}
          </Text>
        </BreedControl>
      ),
      filterFn: "arrIncludesSome",
      size: 1,
      maxSize: 2,
      minSize: 160,
    }),
    columnHelper.accessor("male_names", {
      header: () => "Самцы",
      cell: ({ cell }) => (
        <Text maw="100%" w="100%" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {cell
            .getValue()
            .map((n) => n)
            .join(", ")}
        </Text>
      ),
      enableSorting: false,
      filterFn: "arrIncludesSome",
      size: 3,
      maxSize: 2,
      minSize: 160,
    }),
    columnHelper.accessor("traits" as any, {
      header: () => "Гены в проекте",
      cell: ({ cell }) => (
        <Flex gap="4px" wrap="wrap">
          {cell.getValue().map((a, ind) => (
            <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="xs" />
          ))}
        </Flex>
      ),
      filterFn: (row: any, columnId, filterValue) => filterValue.some((a) => row.original.traits.map((b) => b.label).includes(a)),
      size: 5,
      maxSize: 6,
      minSize: 220,
    }),
    columnHelper.accessor("breed_status", {
      header: () => "Последний статус",
      cell: ({ cell }) => (
        <Text c={breedToColor[cell.getValue()]} fw={500}>
          {bStToLabel[cell.getValue()]}
        </Text>
      ),
      filterFn: "arrIncludesSome",
      size: 11,
      maxSize: 2,
      minSize: 180,
    }),
  ];
};

export const calcTimeleft = (category: ECategories, ovul?: string | null, shed?: string | null) => {
  const left = shed ? dateTimeDiff(dateAddDays(shed, daysAfterShed[category]), "days") : dateTimeDiff(dateAddDays(ovul!, daysAfterOvul[category]), "days");
  const words = declWord(left, ["день", "дня", "дней"]);

  return {
    left,
    words: `До кладки ~${words}`,
  };
};

export const calcEstimatedDate = (category: ECategories, ovul: string | null, shed: string | null) => {
  const res = shed ? getDate(dateAddDays(shed, daysAfterShed[category])) : getDate(dateAddDays(ovul!, daysAfterOvul[category]));
  return `Ожидаемая дата кладки ${res}`;
};

export const getPercentage = (trg, cur) => Number.parseInt((((trg - cur) * 100) / trg).toFixed(0), 10);

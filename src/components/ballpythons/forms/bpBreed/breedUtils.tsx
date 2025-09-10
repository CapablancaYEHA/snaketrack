import { Flex, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { bStToLabel, breedToColor } from "@/components/common/utils";
import { IResBpBreedingList } from "@/api/ballpythons/models";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff, getDate } from "@/utils/time";
import { GenePill } from "../../../common/genetics/geneSelect";
import { ControlMenu } from "./subcomponents";

export const daysAfterOvul = 44;
export const daysAfterShed = 29;
export const daysAfterLaid = 60;
export const daysCriticalThr = 10;

const columnHelper = createColumnHelper<IResBpBreedingList>();

export const makeBpBreedColumns = ({ setBreedId }) => {
  return [
    columnHelper.accessor("female_name", {
      header: () => "Самка",
      filterFn: "arrIncludesSome",
      size: 1,
      maxSize: 2,
      minSize: 82,
    }),
    columnHelper.accessor("male_names", {
      header: () => "Самцы",
      cell: ({ cell }) =>
        cell
          .getValue()
          .map((n) => n)
          .join(", "),
      enableSorting: false,
      filterFn: "arrIncludesSome",
      size: 3,
      maxSize: 2,
      minSize: 144,
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
      filterFn: (row: any, columnId, filterValue) => filterValue.every((a) => row.original.traits.map((b) => b.label).includes(a)),
      size: 5,
      maxSize: 5,
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
      size: 10,
      maxSize: 2,
      minSize: 180,
    }),
    columnHelper.display({
      id: "action",
      cell: ({ row }) => <ControlMenu id={row.original.id} onDelete={setBreedId} clutchId={row.original.clutch_id} />,
      size: 12,
      maxSize: 1,
      minSize: 36,
    }),
  ];
};

export const calcTimeleft = (ovul?: string | null, shed?: string | null) => {
  const left = shed ? dateTimeDiff(dateAddDays(shed, daysAfterShed), "days") : dateTimeDiff(dateAddDays(ovul!, daysAfterOvul), "days");
  const words = declWord(left, ["день", "дня", "дней"]);

  return {
    left,
    words: `До конца инкубации ~${words}`,
  };
};

export const calcEstimatedDate = (ovul: string | null, shed: string | null) => {
  const res = shed ? getDate(dateAddDays(shed, daysAfterShed)) : getDate(dateAddDays(ovul!, daysAfterOvul));
  return `Ожидаемая дата кладки ${res}`;
};

export const getPercentage = (trg, cur) => Number.parseInt((((trg - cur) * 100) / trg).toFixed(0), 10);

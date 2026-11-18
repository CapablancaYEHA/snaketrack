import { useState } from "preact/hooks";
import { Accordion, Anchor, Loader, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IResClutch } from "@/api/breeding/models";
import { ESupaBreed, categoryToShort } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { getDateObj, getDateShort } from "@/utils/time";
import { StackSimpleTable } from "../StackTable/StackSimpleTable";

export const ClutchInvolv = ({ category, sex, snakeId }) => {
  const [value, setValue] = useState<string | null>(null);
  const filterExp = sex === "male" ? (b) => b.filter("males_ids", "cs", `{${snakeId}}`) : (b) => b.eq("female_id", snakeId);
  const { data: involvment, isPending, isError } = useSupaGet<any[]>({ t: ESupaBreed[`${categoryToShort[category].toUpperCase()}_CL_V`], f: filterExp, id: snakeId }, sex != null && value != null);

  return (
    <Accordion variant="separated" radius="md" value={value} onChange={setValue} w="100%" maw="100%">
      <Accordion.Item value="involv_open" bg="transparent" bd={`1px solid var(--mantine-color-dark-5)`}>
        <Accordion.Control fz="xs">
          <Text fw={500} size="xs">
            Участие в кладках
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          {isError ? (
            <Text fw={500} c="var(--mantine-color-error)">
              Не удалось подгрузить данные
            </Text>
          ) : isPending ? (
            <Loader size="xs" display="block" m="auto" />
          ) : (
            <StackSimpleTable
              data={involvment ?? []}
              columns={makeInvColumns({ sex, cat: category })}
              maxHeight={302}
              initSort={[
                {
                  id: "date_laid",
                  desc: true,
                },
              ]}
            />
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

const columnHelper = createColumnHelper<IResClutch>();

const makeInvColumns = ({ sex, cat }) => [
  columnHelper.accessor("date_laid", {
    header: () => "Дата отсчета",
    cell: ({ cell }) => getDateShort(cell.getValue()!),
    size: 1,
    maxSize: 1,
    minSize: 112,
    sortingFn: (rowA: any, rowB: any, k: any) => getDateObj(rowA.getValue("date_laid")) - getDateObj(rowB.getValue("date_laid")),
  }),
  columnHelper.accessor("id", {
    header: () => "Кладка",
    cell: ({ cell }) => (
      <Anchor href={`/clutches/edit/${cat}?id=${cell.getValue()}`} td="underline">
        {cell.getValue()}
      </Anchor>
    ),
    size: 2,
    maxSize: 2,
    minSize: 108,
    enableSorting: false,
  }),
  columnHelper.display({
    id: "partners",
    header: () => "Партнер(ы)",
    cell: ({ row }) => <Text>{sex === "female" ? row.original.males_names.join(", ") : row.original.female_name}</Text>,
    size: 4,
    maxSize: 8,
    minSize: 100,
    enableSorting: false,
  }),
];

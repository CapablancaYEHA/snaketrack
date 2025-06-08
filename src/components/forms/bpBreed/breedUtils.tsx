import { ActionIcon, Flex, Menu, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IResBpBreedingList } from "@/api/models";
import { bStToLabel, breedToColor } from "../../ballpythons/const";
import { GenePill } from "../../genetics/geneSelect";
import { IconSwitch } from "../../navs/sidebar/icons/switch";

const columnHelper = createColumnHelper<IResBpBreedingList>();

const ControlMenu = ({ id }) => {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon size="sm" variant="transparent" color="gray" aria-label="Table Action Kebab">
          <IconSwitch icon="kebab" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item component="a" href={`/breeding/ballpython?id=${id}`}>
          К планированию
        </Menu.Item>
        <Menu.Item onClick={() => undefined}>Удалить</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const breedColumns = [
  columnHelper.accessor("female_name", {
    header: () => "Самка",
    filterFn: "arrIncludesSome",
    size: 1,
    maxSize: 1,
    minSize: 72,
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
    size: 2,
    maxSize: 2,
    minSize: 144,
  }),
  columnHelper.accessor("traits" as any, {
    header: () => "Набор генов",
    cell: ({ cell }) => (
      <Flex gap="4px" wrap="wrap">
        {cell.getValue().map((a, ind) => (
          <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="xs" />
        ))}
      </Flex>
    ),
    filterFn: (row: any, columnId, filterValue) => filterValue.every((a) => row.original.traits.map((b) => b.label).includes(a)),
    size: 4,
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
    size: 9,
    maxSize: 3,
    minSize: 180,
  }),
  columnHelper.display({
    id: "action",
    cell: ({ row }) => <ControlMenu id={row.original.id} />,
    size: 12,
    maxSize: 1,
    minSize: 36,
  }),
];

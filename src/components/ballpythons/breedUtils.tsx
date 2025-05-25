import { Button, Flex, Menu, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { IResBpBreedingList } from "@/api/models";
import { GenePill } from "../genetics/geneSelect";
import { IconSwitch } from "../navs/sidebar/icons/switch";
import { bStToLabel, breedToColor } from "./const";

const columnHelper = createColumnHelper<IResBpBreedingList>();

const ControlMenu = ({ id }) => {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          styles={{
            section: { margin: 0 },
          }}
          leftSection={<IconSwitch icon="kebab" />}
          variant="default"
          size="compact-xs"
          w={22}
        />
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
    size: "auto" as unknown as number,
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
    size: "auto" as unknown as number,
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
    size: "auto" as unknown as number,
  }),
  columnHelper.accessor("breed_status", {
    header: () => "Последний статус",
    cell: ({ cell }) => (
      <Text c={breedToColor[cell.getValue()]} fw={500}>
        {bStToLabel[cell.getValue()]}
      </Text>
    ),
    filterFn: "arrIncludesSome",
    size: "auto" as unknown as number,
  }),
  columnHelper.display({
    id: "action",
    cell: ({ row }) => <ControlMenu id={row.original.id} />,
    size: "auto" as unknown as number,
  }),
];

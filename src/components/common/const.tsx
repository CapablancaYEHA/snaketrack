import { useEffect, useState } from "preact/hooks";
import fallback from "@assets/placeholder.webp";
import { AspectRatio, Box, Image, Indicator, Popover, Stack, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import confetti from "canvas-confetti";
import { ECategories, IResSnakesList } from "@/api/common";
import { catVisited } from "@/pages/SnakeCategories";
import { urlProxyReplace } from "@/utils/other";
import { getAge } from "@/utils/time";
import { Controls, GenesList, SnakeEventsBlock } from "../common/SnakeCard";
import { SexName } from "../common/sexName";
import { IconSwitch } from "../navs/sidebar/icons/switch";
import { snakeStatusToColor, snakeStatusToLabel } from "./Market/utils";
import { RollNumber } from "./RollNumber";
import { hatchFiltFn } from "./StackTable/filters";

const colHelper = createColumnHelper<IResSnakesList>();

export const makeListColumns = ({ openTrans, openFeed, openStatus, openTag }) => {
  return [
    colHelper.accessor("picture", {
      header: (content) => {
        const totalCost = content.table
          .getRowModel()
          .rows.map((a) => a.original.price ?? 0)
          .reduce((t, c) => t + c);
        return totalCost > 0 ? <CategoryCost totalCost={totalCost} /> : " ";
      },
      cell: ({ cell, row }) => (
        <Controls id={row.original.id} openTrans={openTrans} openFeed={openFeed} openTag={openTag} openStatus={openStatus} category={catVisited.value} status={row.original.status}>
          <Stack gap="xs" maw="100%" w="100%">
            <SexName sex={row.original.sex} name={row.original.snake_name} size="md" />
            {row.original.tags ? (
              <Text fw={500} size="xs" c="pink">
                {row.original.tags.map((t) => `#${t}`).join(" ")}
              </Text>
            ) : null}
            <AspectRatio ratio={16 / 9} maw="100%">
              <Image src={urlProxyReplace(cell.getValue())} fit="cover" radius="md" w="100%" fallbackSrc={fallback} loading="lazy" />
            </AspectRatio>
            <GenesList genes={row.original.genes} />
          </Stack>
        </Controls>
      ),
      enableSorting: false,
      size: 1,
      maxSize: 5,
      minSize: 194,
    }),
    colHelper.accessor((row: any) => row.snake_name, {
      id: "names",
      header: undefined,
      cell: undefined,
      enableSorting: true,
    }),
    colHelper.accessor((row: any) => row.sex, {
      id: "sex",
      header: undefined,
      cell: undefined,
      enableColumnFilter: true,
      filterFn: "equals",
    }),
    colHelper.accessor((row: any) => row.notes, {
      id: "notes",
      header: undefined,
      cell: undefined,
    }),
    colHelper.accessor("feeding", {
      header: () => "События",
      cell: ({ cell, row }) => <SnakeEventsBlock feeding={cell.getValue()} weight={row.original.weight} shed={row.original.shed} />,
      enableSorting: false,
      size: 6,
      maxSize: 3,
      minSize: 150,
    }),
    colHelper.accessor("date_hatch", {
      header: () => "Возраст",
      cell: ({ cell }) => <Text size="sm">{getAge(cell.getValue())}</Text>,
      size: 9,
      maxSize: 3,
      minSize: 150,
      filterFn: hatchFiltFn,
    }),
    colHelper.accessor((row: any) => row.tags, {
      id: "tags",
      header: undefined,
      cell: undefined,
      enableSorting: false,
      filterFn: "arrIncludesSome",
    }),
    colHelper.accessor((row: any) => row.genes, {
      id: "genes",
      header: undefined,
      cell: undefined,
      enableSorting: false,
      filterFn: (row: any, columnId, filterValue) => filterValue.some((a) => row.original.genes.map((b) => b.label).includes(a)),
    }),
    colHelper.accessor("status", {
      header: () => "Статус",
      cell: ({ cell }) => (
        <Indicator position="middle-start" inline size={8} color={snakeStatusToColor[cell.getValue()]} processing zIndex={3}>
          <Box>
            <Text fw={500} size="xs" ml="sm">
              {snakeStatusToLabel[cell.getValue()]}
            </Text>
          </Box>
        </Indicator>
      ),
      size: 12,
      maxSize: 1,
      minSize: 98,
      enableSorting: false,
      filterFn: "arrIncludesSome",
    }),
  ];
};

export const segmentedSnakes = [
  {
    label: "Региусы",
    value: ECategories.BP,
  },
  {
    label: "Удавы",
    value: ECategories.BC,
  },
  {
    label: "Маисы",
    value: ECategories.CS,
  },
  {
    label: "Обсолеты",
    value: ECategories.RS,
  },
  {
    label: "Свинки",
    value: ECategories.HN,
  },
  {
    label: "Хондры",
    value: ECategories.MV,
  },
];

export const segmentedCalc = segmentedSnakes.filter((a) => a.value !== ECategories.MV);

const count = 200;
const defaults = {
  origin: { y: 0.7 },
};

function fire(particleRatio, opts) {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
}

const CategoryCost = ({ totalCost }) => {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }

    return () => {
      confetti.reset();
    };
  }, [isOpen]);

  return (
    <Popover position="bottom" withArrow shadow="md" opened={isOpen} onDismiss={() => setOpen(false)} offset={{ mainAxis: 10, crossAxis: 85 }} keepMounted={false}>
      <Popover.Target>
        <Box onClick={() => setOpen((o) => !o)} style={{ cursor: "pointer", position: "relative" }} h={20} mah={20} miw={40}>
          <Indicator position="top-end" inline size={6} color="teal" processing offset={8} style={{ position: "absolute", top: -4 }}>
            <IconSwitch icon="info" width="30" height="30" />
          </Indicator>
        </Box>
      </Popover.Target>
      <Popover.Dropdown>
        <Box w="100%" maw="100%">
          <Text size="xs" ta="left" w="auto">
            Стоимость коллекции в категории
          </Text>
        </Box>
        <Box>
          <RollNumber val={totalCost} size="sm" />
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

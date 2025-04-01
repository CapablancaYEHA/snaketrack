import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import fallback from "@assets/placeholder.png";
import { Box, Flex, Image, LoadingOverlay, Paper, SegmentedControl, Select, Stack, Text, Title } from "@mantine/core";
import { ChartLine } from "@/components/common/Chart/ChartLine";
import { SexName } from "@/components/common/sexName";
import { sortBpGenes } from "@/components/genetics/const";
import { GenePill } from "@/components/genetics/geneSelect";
import { useSnake } from "@/api/hooks";
import { getAge, getDate } from "@/utils/time";

export function Snake() {
  const location = useLocation();
  const [value, setValue] = useState("common");
  const [scale, setScale] = useState("weeks");
  const [view, setView] = useState<"ko" | "snake" | "both">("both");
  const { data, isPending, isError } = useSnake(location.query.id);

  if (isPending) return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />;

  if (isError)
    return (
      <Text fw={500} c="var(--mantine-color-error)">
        Произошла ошибка запроса
      </Text>
    );

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      <Title component="span" order={4} c="yellow.6">
        Подробная информация о змее
      </Title>
      <Box m="0 auto">
        <SegmentedControl
          value={value}
          onChange={setValue}
          data={[
            { label: "Общее", value: "common" },
            { label: "Семейное древо", value: "tree", disabled: true },
          ]}
        />
      </Box>

      <Flex align="flex-start" justify="space-between" columnGap="md" w="100%">
        <Stack>
          <Flex align="flex-start" justify="flex-start" gap="xs">
            <Text>👑Королевский питон</Text>
            <SexName sex={data.sex} name={data.snake_name} />
          </Flex>
          <Image src={data.picture} flex="0 0 0px" fit="cover" radius="md" mih={110} w="auto" maw="100%" h={200} fallbackSrc={fallback} loading="lazy" />
        </Stack>

        <Stack>
          <Text size="md">Дата рождения — {getDate(data.date_hatch)}</Text>
          <Text size="md">⌛ {getAge(data.date_hatch)}</Text>
        </Stack>
      </Flex>
      <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
        {sortBpGenes(data.genes as any).map((a) => (
          <GenePill item={a} key={`${a.label}_${a.id}`} />
        ))}
      </Flex>
      <Paper shadow="sm" radius="lg" p="xl" w="100%">
        <Text size="xs" c="dark.3">
          Ваше примечание
        </Text>
        <Text size="sm">{data.notes ?? "Пусто"}</Text>
      </Paper>

      <Flex justify="space-between" w="100%">
        <Select
          label="Детализация графика"
          data={[
            { label: "Год", value: "years" },
            { label: "Сезон", value: "seasons" },
            { label: "Квартал", value: "quarters" },
            { label: "Месяц", value: "months" },
            { label: "Неделя", value: "weeks" },
            { label: "День", value: "days" },
          ]}
          value={scale}
          onChange={setScale as any}
        />
        <Select
          label="Отображать график для"
          data={[
            { label: "КО", value: "ko" },
            { label: "Животного", value: "snake" },
            { label: "Обоих", value: "both" },
          ]}
          value={view}
          onChange={setView as any}
        />
      </Flex>
      <ChartLine weightData={data?.weight} feedData={data.feeding} scaleX={scale} view={view} />
    </Stack>
  );
}

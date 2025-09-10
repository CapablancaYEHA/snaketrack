import { useLocation } from "preact-iso";
import { useMemo, useState } from "preact/hooks";
import fallback from "@assets/placeholder.png";
import { Button, Flex, Image, NumberFormatter, Paper, Select, Space, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty, toString } from "lodash-es";
import { ChartBubble, ChartLine } from "@/components/common/Chart/Line";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { FeedSnake } from "@/components/common/forms/feedSnake/formFeedSnake";
import { sortSnakeGenes } from "@/components/common/genetics/const";
import { GenePill } from "@/components/common/genetics/geneSelect";
import { SexName } from "@/components/common/sexName";
import { detailsDict, subjectDict } from "@/components/common/utils";
import { ECategories, IResSnakesList } from "@/api/common";
import { useUpdSnakeFeeding } from "@/api/hooks";
import { getAge, getDate } from "@/utils/time";
import { snakeFeedColumns } from "./utils";

const isFeedOpen = signal<boolean>(false);

interface IProp {
  title: string;
  category: ECategories;
  data: IResSnakesList;
}

export function SnakeFull({ title, category, data }: IProp) {
  const location = useLocation();
  const [scale, setScale] = useState("weeks");
  const [view, setView] = useState<"ko" | "snake" | "both">("both");
  const { mutate: feed, isPending: isFeedPend } = useUpdSnakeFeeding(category);

  const feedTable = useMemo(() => data?.feeding?.filter((a) => Object.values(a)?.some((b) => b != null)), [toString(data?.feeding)]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Title component="span" order={4} c="yellow.6">
        Подробная информация о змее
      </Title>
      <Flex gap="sm">
        <Button size="compact-xs" component="a" href={`/snakes/edit/${category}?id=${location.query.id}`}>
          Редактировать
        </Button>
        <Button size="compact-xs" onClick={() => (isFeedOpen.value = true)}>
          Добавить событие
        </Button>
      </Flex>
      {/* <Box m="0 auto">
        <SegmentedControl
          value={value}
          onChange={setValue}
          data={[
            { label: "Общее", value: "common" },
            { label: "Семейное древо", value: "tree", disabled: true },
          ]}
        />
      </Box> */}
      <Flex align="stretch" columnGap="xl" rowGap="sm" w="100%" direction={{ base: "column", sm: "row" }}>
        <Stack flex={{ base: "1", sm: "0 1 50%" }}>
          <Flex justify="flex-start" gap="xs" align="center">
            <Text>{title}</Text>
            <SexName sex={data.sex} name={data.snake_name} />
          </Flex>
          <Image src={data.picture} fit="cover" radius="md" w="auto" maw="100%" fallbackSrc={fallback} loading="lazy" mah={{ base: "180px", sm: "260px" }} />
        </Stack>
        <Stack>
          <Text size="md">Дата рождения — {getDate(data.date_hatch)}</Text>
          <Text size="md">⌛ {getAge(data.date_hatch)}</Text>
          {data.price ? (
            <Text size="md" component="div">
              Стоимость приобретения — <NumberFormatter suffix=" ₽" value={data.price} thousandSeparator=" " />
            </Text>
          ) : null}
        </Stack>
      </Flex>
      <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
        {sortSnakeGenes(data.genes as any).map((a) => (
          <GenePill item={a} key={`${a.label}_${a.id}`} />
        ))}
      </Flex>
      <Paper shadow="sm" radius="md" p="sm" w="100%">
        <Text size="xs" c="dark.3">
          Ваше примечание
        </Text>
        <Space h="sm" />
        <Text size="sm">{data.notes ?? "Пусто"}</Text>
      </Paper>
      {!data?.weight && !isEmpty(data.feeding) && data.feeding?.every((a) => Object.values(a)?.every((b) => b == null)) ? (
        <Text size="md" fw={500} ta="center" w="100%">
          Информация об изменении веса\кормлениях отсутствует
        </Text>
      ) : (
        <>
          <Flex justify="space-between" w="100%" gap="sm">
            <Select label="Детализация графика" data={detailsDict} value={scale} onChange={setScale as any} />
            <Select label="На графике" data={subjectDict} value={view} onChange={setView as any} />
          </Flex>
          <ChartLine weightData={data?.weight} feedData={data.feeding} scaleX={scale} view={view} />
        </>
      )}
      <StackTable
        data={feedTable ?? []}
        columns={snakeFeedColumns}
        maxHeight={302}
        initSort={[
          {
            id: "feed_last_at",
            desc: false,
          },
        ]}
      />
      <Space h="lg" />
      <FeedSnake
        opened={isFeedOpen.value}
        close={() => {
          isFeedOpen.value = false;
        }}
        snake={data}
        title="Удав"
        handleAction={feed}
        isPend={isFeedPend}
      />
      <ChartBubble shedData={data.shed} />
      <Space h="lg" />
    </Stack>
  );
}

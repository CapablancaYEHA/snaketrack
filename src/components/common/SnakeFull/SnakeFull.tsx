import { useLocation } from "preact-iso";
import { useMemo, useState } from "preact/hooks";
import fallback from "@assets/placeholder.png";
import { Box, Button, Flex, Image, Indicator, NumberFormatter, Paper, RemoveScroll, SegmentedControl, Select, Space, Stack, Text, Title, Tooltip } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty, toString } from "lodash-es";
import { ChartBubble, ChartLine } from "@/components/common/Chart/Line";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { FeedSnake } from "@/components/common/forms/feedSnake/formFeedSnake";
import { sortSnakeGenes } from "@/components/common/genetics/const";
import { GenePill } from "@/components/common/genetics/geneSelect";
import { SexName } from "@/components/common/sexName";
import { categToTitle, detailsDict, sliceDict, subjectDict } from "@/components/common/utils";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, IFeed, IFeedReq, IResSnakesList, categoryToBaseTable } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { getAge, getDate } from "@/utils/time";
import { FamilyTree } from "../FamilyTree";
import { snakeStatusToColor, snakeStatusToLabel } from "../Market/utils";
import { EditStats } from "../forms/editStats/formEditStats";
import { snakeFeedColumns } from "./utils";

const isFeedOpen = signal<boolean>(false);
const isEditMode = signal<boolean>(false);

interface IProp {
  title: string;
  category: ECategories;
  data: IResSnakesList;
  snakeId: string;
}

export function SnakeFull({ title, category, data, snakeId }: IProp) {
  const location = useLocation();
  const [tab, setTab] = useState("common");
  const [scale, setScale] = useState("weeks");
  const [view, setView] = useState<"ko" | "snake" | "both">("both");
  const [slice, setSlice] = useState<"all" | "2" | "6" | "12">("all");
  const { mutate: feed, isPending: isFeedPend } = useSupaUpd<IFeedReq>(categoryToBaseTable[category]);

  const feedTable = useMemo(() => data?.feeding?.filter((a) => Object.values(a)?.some((b) => b != null)), [toString(data?.feeding)]) as IFeed[];

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Box>
        <Title component="span" order={4} c="yellow.6">
          Подробная информация
        </Title>
        <Flex justify="flex-start" gap="xs" align="center">
          <Text>{title}</Text>
          <SexName sex={data.sex} name={data.snake_name} />
        </Flex>
      </Box>

      {tab !== "tree" ? (
        <Flex gap="sm" maw="100%" w="100%" wrap="wrap">
          <Button size="compact-xs" variant="default" component="a" href={`/snakes/edit/${category}?id=${location.query.id}`}>
            Редактировать
          </Button>
          <Button size="compact-xs" onClick={() => (isFeedOpen.value = true)}>
            Добавить событие
          </Button>
          {!["on_sale", "reserved", "sold"].includes(data.status) ? (
            <Button size="compact-xs" variant="default" component="a" href={`/market/add/${category}?id=${location.query.id}`}>
              Выставить на продажу
            </Button>
          ) : null}
          <Box ml="auto" pl="md">
            <Indicator position="middle-start" inline size={8} color={snakeStatusToColor[data.status]} processing zIndex={3}>
              <Text fw={500} size="xs" ml="sm">
                {snakeStatusToLabel[data.status]}
              </Text>
            </Indicator>
          </Box>
        </Flex>
      ) : null}

      <Box m="0 auto">
        <SegmentedControl
          size="xs"
          value={tab}
          onChange={setTab}
          data={[
            { label: "Общее", value: "common" },
            { label: "Семейное древо", value: "tree" },
          ]}
        />
      </Box>
      {tab === "tree" ? (
        <RemoveScroll style={{ maxWidth: "100%", width: "100%", display: "flex" }}>
          <FamilyTree targetId={snakeId} category={category} currentMother={data.mother_id} currentFather={data.father_id} />
        </RemoveScroll>
      ) : (
        <>
          <Flex align="stretch" columnGap="xl" rowGap="sm" w="100%" direction={{ base: "column", sm: "row" }}>
            <Stack flex={{ base: "1", sm: "0 1 50%" }}>
              <Image src={data.picture} fit="cover" radius="md" w="auto" maw="100%" fallbackSrc={fallback} loading="lazy" mah={{ base: "180px", sm: "260px" }} />
            </Stack>
            <Stack gap="sm">
              <Text size="sm">Дата рождения — {getDate(data.date_hatch)}</Text>
              <Text size="sm">⌛ {getAge(data.date_hatch)}</Text>
              {data.price ? (
                <Text size="sm" component="div">
                  Стоимость приобретения — <NumberFormatter prefix="₽ " value={data.price} thousandSeparator=" " />
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
            <Text size="sm" fw={500} ta="center" w="100%">
              Информация об изменении веса\кормлениях отсутствует
            </Text>
          ) : (
            <>
              <Flex w="100%" gap="xs" wrap="wrap">
                <Select label="Масштаб графика" data={detailsDict} value={scale} onChange={setScale as any} size="xs" flex="0 1 auto" />
                <Select label="На графике" data={subjectDict} value={view} onChange={setView as any} size="xs" flex="0 1 auto" />
                <Select label="Отображать данные" data={sliceDict} value={slice} onChange={setSlice as any} size="xs" flex="0 1 auto" />
              </Flex>
              <ChartLine weightData={data?.weight} feedData={data?.feeding} scaleX={scale} view={view} dateSlice={slice} />
            </>
          )}
          <Button variant="default" rightSection={<IconSwitch icon="edit" width="16" height="16" />} onClick={() => (isEditMode.value = true)} disabled={isEmpty(data?.feeding) && isEmpty(data?.weight)} size="compact-xs" ml="auto">
            Корректировать данные
          </Button>
          <StackTable
            data={feedTable ?? []}
            columns={snakeFeedColumns}
            maxHeight={302}
            initSort={[
              {
                id: "feed_last_at",
                desc: true,
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
            title={categToTitle[category]}
            handleAction={feed}
            isPend={isFeedPend}
          />
          <ChartBubble shedData={data.shed} />
          <Space h="lg" />
          <EditStats table={categoryToBaseTable[category]} opened={isEditMode.value} close={() => (isEditMode.value = false)} weight={data?.weight ?? []} feeding={data?.feeding ?? []} id={location.query.id} />
        </>
      )}
    </Stack>
  );
}

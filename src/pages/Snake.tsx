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

// let mock = {
//   w: [
//     { date: "2025-02-22 00:00:00.000+0300", weight: 90 },
//     { date: "2025-03-25 00:00:00.000+0300", weight: 98 },
//     { date: "2025-03-27 00:00:00.000+0300", weight: 100 },
//     { date: "2025-03-28 00:00:00.000+0300", weight: 98 },
//   ],
//   f: [
//     { feed_last_at: "2025-03-22 00:00:00.000+0300 ", feed_weight: 22 },
//     { feed_last_at: "2025-03-24 00:00:00.000+0300 ", feed_weight: 28 },
//     { feed_last_at: "2025-03-26 00:00:00.000+0300 ", feed_weight: 30 },
//   ],
// };

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
      <ChartLine weightData={data?.weight} feedData={data?.feeding} scaleX={scale} view={view} />
    </Stack>
  );
}

// FIXME delete
// const mock_snake = {
//   pre_id: 93,
//   id: "11111",
//   snake_name: "test2",
//   date_hatch: "2025-03-05T00:00:00+03:00",
//   sex: "female",
//   genes: [
//     {
//       id: 201,
//       gene: "rec",
//       alias: null,
//       label: "66% Het Ultramel",
//       hasHet: true,
//       hasSuper: false,
//     },
//     {
//       id: 208,
//       gene: "rec",
//       alias: null,
//       label: "50% Het Ultramel",
//       hasHet: true,
//       hasSuper: false,
//     },

//     {
//       id: 189,
//       gene: "inc-dom",
//       alias: null,
//       label: "Spider",
//       hasHet: false,
//       hasSuper: false,
//     },
//     {
//       id: 112,
//       gene: "dom",
//       alias: null,
//       label: "Leopard",
//       hasHet: false,
//       hasSuper: true,
//     },
//     {
//       id: 4,
//       gene: "rec",
//       alias: null,
//       label: "Zed",
//       hasHet: true,
//       hasSuper: false,
//     },
//     {
//       id: 6,
//       gene: "rec",
//       alias: null,
//       label: "Het Albino",
//       hasHet: true,
//       hasSuper: false,
//     },
//   ],
//   origin: "purchase",
//   parents: null,
//   price: null,
//   picture: "https://ezryvcyxbrgcivccpydc.supabase.co/storage/v1/object/public/snakepics/9d87ef40-d470-41a2-a25c-61e73a487dbc/OVh99FbH",
//   owner_id: "9d87ef40-d470-41a2-a25c-61e73a487dbc",
//   owner_name: "Capablanca",
//   status: null,
//   last_action: "update",
//   notes:
//     "Купила детеныша королевского питона,через пару дней мои знакомые которые вообще не разбираются в змеях,заметили,что она трясет головой..я подумала ну случайность может какая то.Спустя несколько дней она начала скажем так кружиться..крутить головой..Сначала подумала,что перегрев,но нет. она и ее брат стоят на одном коврике,температура нормальная я все проверила.да и сама она была не горячая и даже не теплая. Живет в боксе,вода свежая стоит, вентиляция хорошая. ей от силы месяц,еще не разу не кушала,но уже пролинялась вроде бы у заводчика.Морфа Bumblebee. Есть видео,где видно,как она крутится.",
//   weight: null,
//   feeding: [
//     {
//       feed_ko: null,
//       feed_weight: null,
//       feed_comment: null,
//       feed_last_at: null,
//     },
//   ],
// };

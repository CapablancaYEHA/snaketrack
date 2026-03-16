import { useEffect, useState } from "preact/hooks";
import { Box, Checkbox, Flex, Highlight, LoadingOverlay, Popover, SegmentedControl, Select, Space, Stack, Text, Title } from "@mantine/core";
import { DatePickerInput, DateValue } from "@mantine/dates";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { ChartAnalytics } from "@/components/analytics/Chart";
import { calculateHash, chaining, handleSingleAge, handleSingleRange } from "@/components/analytics/filters";
import { handleSingleSel } from "@/components/common/Market/filters";
import { sexHardcode } from "@/components/common/forms/snakeBreed/common";
import { GenesSelect } from "@/components/common/genetics/geneSelect";
import { SkelChart } from "@/components/common/skeletons";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, EGenesView, IResAnalytics, categoryToAnalytics } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { dateToSupabaseTime, getDateObj, getStartOf } from "@/utils/time";
import css from "../components/analytics/styles.module.scss";

const defaultSort = "changed_at:asc";
const defaultRange: any = [dateToSupabaseTime(getStartOf(new Date(), "year")), dateToSupabaseTime(new Date())];
const sigPrice = signal<string>("changed_at");

export function Analytics() {
  const [cat, setCat] = useState<ECategories | null>(null);
  const [sqlFilt, setSqlFilt] = useState<any>({});
  const [sort, setSort] = useState<string>("");
  const [range, setRange] = useState<[DateValue, DateValue]>(defaultRange);
  const isCanQuery = Boolean(cat) && sqlFilt?.["hash"] != null;
  let filter = isCanQuery ? (b) => chaining.call(b, sort, sqlFilt, []) : () => {};

  const { data, isRefetching, isLoading, isPending, isError } = useSupaGet<IResAnalytics>({ t: categoryToAnalytics[cat!], f: filter, id: [sort, sqlFilt] }, isCanQuery);

  useEffect(() => {
    if (!cat) setCat((localStorage.getItem("ANAL_VISITED") as ECategories) ?? ECategories.MV);

    setSort(defaultSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (range.length > 1) {
      if (sigPrice.value === "changed_at") {
        setSqlFilt((s) => {
          // eslint-disable-next-line no-param-reassign
          delete s.completed_at;
          return s;
        });
        handleSingleRange(range, "changed_at", setSqlFilt);
      } else {
        setSqlFilt((s) => {
          // eslint-disable-next-line no-param-reassign
          delete s.changed_at;
          return s;
        });
        handleSingleRange(range, "completed_at", setSqlFilt);
      }
    }
  }, [sigPrice.value, range]);

  const isFilterNull = isEmpty(sqlFilt);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Title component="span" order={4} c="yellow.6">
        Аналитика маркета
      </Title>
      <SegmentedControl
        style={{ alignSelf: "center" }}
        size="xs"
        value={cat as any}
        onChange={(a: any) => {
          setCat(a);
          localStorage.setItem("ANAL_VISITED", a);
        }}
        flex="1 1 100%"
        w="100%"
        maw="252px"
        data={[
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
            label: "Хондры",
            value: ECategories.MV,
          },
        ]}
      />
      {cat ? (
        <GenesSelect
          onChange={(a: any) => {
            if (!isEmpty(a)) {
              handleSingleSel(calculateHash(a), "hash", setSqlFilt);
            } else {
              handleSingleSel([], "hash", setSqlFilt);
            }
          }}
          label="Поиск по генам"
          category={cat}
          view={EGenesView.STD}
          required
        />
      ) : null}
      <Box>
        <Highlight highlight={["*"]} highlightStyles={{ padding: "0 4px 0 4px" }} inline size="xs" opacity={0.6}>
          * Использование синонимов (алиасов) названий генов , а так же отдельно прописанных генов (вместо готовых комбо/морф) влияет на результаты поиска. Если вас интересуют только геты, попробуйте поискать с явным указанием Normal при этом.
        </Highlight>
      </Box>
      <Box w="100%" maw="100%" className={css.selectables}>
        <DatePickerInput
          type="range"
          label="Период"
          valueFormat="DD MMMM YYYY"
          highlightToday
          locale="ru"
          value={range}
          minDate={getDateObj(getStartOf("2026-01-01", "year")) as any}
          maxDate={new Date()}
          onChange={(n) => setRange(n.filter((p) => p != null).map((p: any) => dateToSupabaseTime(p)) as any)}
        />
        <Select miw={0} data={sexHardcode} onChange={(a: any) => handleSingleSel(a, "sex", setSqlFilt)} label="Пол" placeholder="Любой" clearable />
        <Select
          miw={0}
          data={[
            {
              label: "Старше 6 месяцев",
              value: "lte-6",
            },
            {
              label: "Старше 1 года",
              value: "lte-12",
            },
            {
              label: "Старше 2 лет",
              value: "lte-24",
            },
            {
              label: "Младше 6 месяцев",
              value: "gte-6",
            },
            {
              label: "Младше 1 года",
              value: "gte-12",
            },
          ]}
          onChange={(a: any) => handleSingleAge(a, "date_hatch", setSqlFilt)}
          onClear={() => handleSingleAge(undefined, "date_hatch", setSqlFilt)}
          label="Возраст"
          placeholder="Любой"
          clearable
        />
      </Box>
      <Flex gap="sm" w="100%" maw="100%" align="center">
        <Checkbox size="sm" checked={sigPrice.value === "completed_at"} label="Только проданные" onChange={(e: any) => (sigPrice.value = e.currentTarget.checked ? "completed_at" : "changed_at")} />
        <Popover width={240} position="bottom" clickOutsideEvents={["mouseup", "touchend"]} withArrow shadow="md">
          <Popover.Target>
            <Box style={{ cursor: "pointer" }}>
              <IconSwitch icon="info" width="18" height="18" />
            </Box>
          </Popover.Target>
          <Popover.Dropdown style={{ pointerEvents: "none" }} p="xs">
            <Text size="xs">
              По умолчанию показана динамика цен до продажи (например, продавцы меняли цены, пока спрос не стал достаточно высок).
              <br />
              Отметьте чекбокс, чтобы видеть только цены, для которых зафиксирован статус состоявшейся продажи
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Flex>
      {isLoading ? (
        <>
          <SkelChart />
          <Space h="md" />
        </>
      ) : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : !isCanQuery ? (
        <Box ta="center" w="100%">
          Набор генов обязателен для поиска
        </Box>
      ) : isEmpty(data) && !isPending ? (
        <Box maw="100%" w="100%" ta="center">
          <Text fw={500}>{isFilterNull ? "Нет данных для аналитики" : "Не найдено предложений для заданной фильтрации"}</Text>
        </Box>
      ) : !isEmpty(data) ? (
        <ChartAnalytics dt={data} />
      ) : null}
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </Stack>
  );
}

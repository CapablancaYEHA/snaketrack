import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Box, Button, Checkbox, Drawer, Flex, LoadingOverlay, SegmentedControl, Select, Space, Stack, Text, Title } from "@mantine/core";
import { useDisclosure, useInViewport } from "@mantine/hooks";
import { isEmpty } from "lodash-es";
import { useQueryState } from "nuqs";
import { adStatsHardcode, sexHardcode } from "@/components/ballpythons/forms/bpBreed/common";
import { chaining, handleMultiContainsJson, handleMultiIn, handleMultiNotIn, handleSingleSel, multiParser, singleParser } from "@/components/common/Market/filters";
import { marketColumns } from "@/components/common/Market/utils";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { SkelTable } from "@/components/common/skeletons";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, ESupabase, IMarketRes } from "@/api/common";
import { useSnakeGenes, useSupaInfiniteGet } from "@/api/hooks";

export function Market() {
  const { ref, inViewport } = useInViewport();
  const [cat, setCat] = useQueryState("cat");
  const [sqlFilt, setSqlFilt] = useQueryState<any>("single", singleParser);
  const [sqlMultFilt, setSqlMultFilt] = useQueryState<any>("multi", multiParser);
  const [sort, setSort] = useQueryState("sort");
  const [opened, { open, close }] = useDisclosure();

  let filter = cat ? (b) => chaining.call(b.eq("category", cat), sort, sqlFilt, sqlMultFilt) : () => {};

  const { data, isLoading, isRefetching, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useSupaInfiniteGet<IMarketRes[]>({ t: ESupabase.MRKT_V, f: filter, id: [cat, sort, sqlFilt, sqlMultFilt] }, Boolean(cat));
  const market = data?.pages.flatMap((p) => p.data);
  const { data: genes } = useSnakeGenes(cat as any, Boolean(cat));

  const isFilterNull = isEmpty(sqlFilt) && (isEmpty(sqlMultFilt) || sqlMultFilt["status"]);

  useEffect(() => {
    if (!cat) setCat(localStorage.getItem("MARKET_VISITED"));
    setSort("created_at:desc");
    // FIXME
    // setSqlMultFilt({ status: "in-on_sale" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inViewport, hasNextPage, isFetchingNextPage]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Маркет
        </Title>
        {cat ? (
          <Button size="compact-xs" variant="default" component="a" href={`/market/add/${cat}`} ml="auto">
            Разместить объявление
          </Button>
        ) : null}
      </Flex>
      <SegmentedControl
        style={{ alignSelf: "center" }}
        size="xs"
        value={cat as any}
        onChange={(a: any) => {
          setCat(a);
          localStorage.setItem("MARKET_VISITED", a);
        }}
        w="100%"
        maw="320px"
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
        ]}
      />
      <Box>
        <Button variant={isFilterNull ? "default" : "filled"} color={isFilterNull ? undefined : "blue"} leftSection={<IconSwitch icon="adjust" width="16" height="16" />} onClick={open} size="compact-xs">
          Фильтры {isFilterNull ? "" : "применены"}
        </Button>
      </Box>
      <Select
        data={[
          { label: "Свежие", value: "created_at:desc" },
          { label: "Старые", value: "created_at:asc" },
          { label: "Сначала дороже", value: "sale_price:desc" },
          { label: "Сначала дешевле", value: "sale_price:asc" },
          { label: "Сначала старше", value: "date_hatch:asc" },
          { label: "Сначала моложе", value: "date_hatch:desc" },
        ]}
        onChange={(a) => setSort(a)}
        value={sort}
        size="xs"
        label="Сортировка"
        clearable
      />
      <Drawer
        opened={opened}
        onClose={close}
        title={<Title order={5}>Фильтрация</Title>}
        position="top"
        offset={16}
        styles={{
          inner: {
            justifyContent: "center",
          },
          content: {
            height: "auto",
            width: "auto",
            maxWidth: 640,
          },
        }}
        keepMounted
      >
        <Flex gap="md" wrap="nowrap" align="end">
          <Select flex="1 1 50%" miw={0} data={sexHardcode} value={sqlFilt?.["sex"] ? sqlFilt["sex"].split("-")[1] : null} onChange={(a: any) => handleSingleSel(a, "sex", setSqlFilt)} label="Пол" placeholder="Не выбран" />
          <MaxSelectedMulti
            miw={0}
            flex="1 1 50%"
            label="Только в городах"
            initVal={sqlMultFilt?.["city_code"] ? !sqlMultFilt["city_code"].includes("not_in") && sqlMultFilt["city_code"].split("-")[1].split(",") : null}
            onChange={(a: any) => handleMultiIn(a, "city_code", setSqlMultFilt)}
            data={[
              {
                label: "Москва",
                value: "7700000000000",
              },
              {
                label: "Питер",
                value: "7800000000000",
              },
            ]}
            dataHasLabel
          />
        </Flex>
        <Space h="md" />
        <Flex gap="md" wrap="nowrap" align="end">
          <MaxSelectedMulti
            miw={0}
            flex="1 1 50%"
            label="Исключить города"
            initVal={sqlMultFilt?.["city_code"] ? sqlMultFilt["city_code"].includes("not_in") && sqlMultFilt["city_code"].split("-")[1].split(",") : null}
            onChange={(a: any) => handleMultiNotIn(a, "city_code", setSqlMultFilt)}
            data={[
              {
                label: "Москва",
                value: "7700000000000",
              },
              {
                label: "Питер",
                value: "7800000000000",
              },
            ]}
            dataHasLabel
          />
          <MaxSelectedMulti
            flex="1 1 50%"
            label="Гены"
            initVal={sqlMultFilt?.["genes"] ? sqlMultFilt["genes"].split("-")[1].split(",") : null}
            onChange={(a: any) => handleMultiContainsJson(a, "genes", setSqlMultFilt)}
            data={(genes ?? [])?.map((g) => g.label)}
          />
        </Flex>
        <Space h="md" />
        <Flex gap="md" wrap="nowrap" align="end">
          <MaxSelectedMulti
            miw={0}
            flex="1 1 50%"
            label="Статус продажи"
            initVal={sqlMultFilt?.["status"] ? sqlMultFilt["status"].includes("in") && sqlMultFilt["status"].split("-")[1].split(",") : null}
            onChange={(a: any) => handleMultiIn(a, "status", setSqlMultFilt)}
            data={adStatsHardcode}
            dataHasLabel
          />
        </Flex>
        {/* <Space h="md" />
        <Flex>
          <Button
            size="compact-xs"
            onClick={() => {
              setSqlMultFilt({ status: "in-on_sale" });
              //   handleMultiIn("in-on_sale", "status", setSqlMultFilt);
              handleSingleSel("", "sex", setSqlFilt);
            }}
            ml="auto"
            variant="default"
            disabled={isFilterNull}
          >
            Сбросить все
          </Button>
        </Flex> */}
      </Drawer>
      {isLoading ? <SkelTable /> : null}

      {!cat ? (
        <Text fw={500} component="span">
          Выберите категорию маркета
        </Text>
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(market) ? (
        <Box maw="100%" w="100%" ta="center">
          <Text fw={500}>{isFilterNull ? "Нет предложений в категории" : "Не найдено предложений для заданной фильтрации"}</Text>
        </Box>
      ) : (
        <StackTable data={market ?? []} columns={marketColumns} />
      )}
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      <Box ref={ref} w="100%" h="1" />
    </Stack>
  );
}

import { useEffect } from "preact/hooks";
import { startSm } from "@/styles/theme";
import { Box, Button, Checkbox, Chip, CopyButton, Drawer, Flex, Loader, LoadingOverlay, Mark, Pill, SegmentedControl, Select, Space, Stack, Text, Title } from "@mantine/core";
import { useDisclosure, useInViewport, useMediaQuery } from "@mantine/hooks";
import { isEmpty } from "lodash-es";
import { useQueryState } from "nuqs";
import { chaining, handleMultiContainsJson, handleMultiIn, handleMultiNotIn, handleSingleSel, multiParser, singleParser } from "@/components/common/Market/filters";
import { adStatsHardcode, marketColumns } from "@/components/common/Market/utils";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { sexHardcode } from "@/components/common/forms/snakeBreed/common";
import { SkelTable } from "@/components/common/skeletons";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, ESupabase, IMarketRes } from "@/api/common";
import { useSnakeGenes, useSupaInfiniteGet } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";

export function Market() {
  const { ref, inViewport } = useInViewport();
  const dt = {
    title: "snaketrack.ru",
    text: "Подборка змей",
    url: window.location.href,
  };
  const isCan = navigator?.canShare?.(dt);
  const isMinSm = useMediaQuery(startSm);
  const userId = localStorage.getItem("USER");
  const [cat, setCat] = useQueryState("cat");
  const [sqlFilt, setSqlFilt] = useQueryState<any>("single", singleParser);
  const [sqlMultFilt, setSqlMultFilt] = useQueryState<any>("multi", multiParser);
  const [sort, setSort] = useQueryState("sort");
  const [opened, { open, close }] = useDisclosure();

  let filter = cat ? (b) => chaining.call(b.eq("category", cat), sort, sqlFilt, sqlMultFilt) : () => {};

  const { data, isLoading, isRefetching, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useSupaInfiniteGet<IMarketRes[]>({ t: ESupabase.MRKT_V, f: filter, id: [cat, sort, sqlFilt, sqlMultFilt] }, Boolean(cat));
  const market = data?.pages.flatMap((p) => p.data);
  const { data: genes } = useSnakeGenes(cat as any, Boolean(cat));
  const { data: profile } = useProfile(userId, userId != null);

  const share = async (func) => {
    try {
      if (!isCan) {
        func();
      } else {
        await navigator.share(dt);
      }
    } catch {
      func();
    }
  };

  useEffect(() => {
    if (!cat) setCat(localStorage.getItem("MARKET_VISITED") ?? ECategories.BP);
    if (isEmpty(sqlMultFilt)) setSqlMultFilt({ status: "in-on_sale" });
    setSort("created_at:desc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inViewport, hasNextPage, isFetchingNextPage]);

  const isFilterNull = isEmpty(sqlFilt) && sqlMultFilt?.status === "in-on_sale" && isEmpty(Object.keys(sqlMultFilt ?? {})?.filter((k) => k !== "status"));

  const isNoname = profile?.username == null;

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Маркет
        </Title>
        {cat ? (
          <Stack gap="xs" ml="auto" align="start" justify="start">
            {isNoname ? (
              <Text size="xs">
                <Mark color="orange" px="4px">
                  Нужно задать имя аккаунта
                </Mark>
              </Text>
            ) : null}
            <Button size="compact-xs" variant="default" component={isNoname ? "button" : "a"} href={isNoname ? "" : `/market/add/${cat}`} ml="auto" disabled={isNoname}>
              Разместить объявление
            </Button>
          </Stack>
        ) : null}
      </Flex>
      <Checkbox
        size="xs"
        label="Показать только мои объявления"
        checked={sqlFilt?.["owner_id"]?.split("eq-")[1] === localStorage.getItem("USER")}
        onChange={() => handleSingleSel(sqlFilt?.["owner_id"]?.split("eq-")[1] === localStorage.getItem("USER") ? null : localStorage.getItem("USER"), "owner_id", setSqlFilt)}
        style={{ whiteSpace: "pre-wrap" }}
      />
      {!isFilterNull ? (
        <Box maw="100%" w="100%">
          <CopyButton value="window.location.href" timeout={3000}>
            {({ copied, copy }) => (
              <Button variant="default" size="compact-xs" onClick={() => share(copy)} ml="auto">
                {(copied && isCan) || isCan ? "Поделиться подборкой" : copied ? "Скопировано" : "Копировать"}
              </Button>
            )}
          </CopyButton>
        </Box>
      ) : null}
      <SegmentedControl
        style={{ alignSelf: "center" }}
        size="xs"
        value={cat as any}
        onChange={(a: any) => {
          setCat(a);
          localStorage.setItem("MARKET_VISITED", a);
        }}
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
      <Flex wrap="nowrap" w="100%" maw="100% " gap="lg" align="end">
        <Select
          data={[
            { label: "Новые", value: "created_at:desc" },
            { label: "Давние", value: "created_at:asc" },
            { label: "Сначала дороже", value: "sale_price:desc" },
            { label: "Сначала дешевле", value: "sale_price:asc" },
            { label: "Сначала старше", value: "date_hatch:asc" },
            { label: "Сначала моложе", value: "date_hatch:desc" },
          ]}
          onChange={(a) => setSort(a)}
          value={sort}
          size="xs"
          label="Сортировка"
        />
        <Box>
          <Button variant={isFilterNull ? "default" : "filled"} color={isFilterNull ? undefined : "blue"} leftSection={<IconSwitch icon="adjust" width="16" height="16" />} onClick={open} size="xs">
            Фильтры {isFilterNull ? "" : "применены"}
          </Button>
        </Box>
      </Flex>

      <Drawer
        opened={opened}
        onClose={close}
        title={<Title order={5}>Фильтрация</Title>}
        position="top"
        offset="calc(16px + env(safe-area-inset-top))"
        styles={{
          inner: {
            justifyContent: "center",
          },
          content: {
            height: "auto",
            width: "auto",
            maxWidth: isMinSm ? "640px" : "100%",
          },
        }}
        keepMounted
      >
        {!isFilterNull && sqlFilt?.["owner_id"] ? (
          <>
            <Box maw="100%" w="100%" flex="1 1 50%">
              <Chip defaultChecked onChange={() => handleSingleSel(null, "owner_id", setSqlFilt)} size="xs" color="red" icon={<IconSwitch icon="cross" width="12" height="12" />}>
                {sqlFilt?.["owner_id"]?.split("eq-")[1] === localStorage.getItem("USER") ? "Только мои объявления" : "Фильтр по продавцу"}
              </Chip>
            </Box>
            <Space h="xs" />
          </>
        ) : null}
        <Flex gap="md" wrap="nowrap" align="end">
          <MaxSelectedMulti
            miw={0}
            flex="1 1 50%"
            label="Только в городах"
            initVal={sqlMultFilt?.["city_code"]?.startsWith("in") && sqlMultFilt?.["city_code"]?.split("-")?.[1]?.split(",")}
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
          <MaxSelectedMulti
            miw={0}
            flex="1 1 50%"
            label="Исключить города"
            initVal={sqlMultFilt?.["city_code"]?.startsWith("not_in") && sqlMultFilt?.["city_code"]?.split("-")?.[1]?.split(",")}
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
        </Flex>
        <Space h="md" />
        <Flex gap="md" wrap="nowrap" align="end">
          <Select flex="1 1 50%" miw={0} data={sexHardcode} value={sqlFilt?.["sex"] ? sqlFilt["sex"].split("-")[1] : null} onChange={(a: any) => handleSingleSel(a, "sex", setSqlFilt)} label="Пол" placeholder="Не выбран" />
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
            label="Доступность"
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
      <Box ref={ref} w="100%" h={2} />
      {isFetchingNextPage ? (
        <Flex justify="center" maw="100%" w="100%">
          <Loader size="sm" />
        </Flex>
      ) : null}
      {data?.pages?.length > 1 && !hasNextPage ? (
        <Box maw="100%" w="100%">
          <Text size="xs" ta="center">
            Больше нет элементов для загрузки
          </Text>
        </Box>
      ) : null}
    </Stack>
  );
}

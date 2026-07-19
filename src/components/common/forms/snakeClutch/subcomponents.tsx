import { useEffect, useState } from "preact/hooks";
import { startMd, startSm, tabletThreshold } from "@/styles/theme";
import fallback from "@assets/placeholder.webp";
import { ActionIcon, Anchor, Box, Button, CopyButton, Fieldset, Flex, Grid, Image, Loader, Modal, Progress, SegmentedControl, Select, SimpleGrid, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { Controller, FormProvider, useFormContext, useWatch } from "react-hook-form";
import { sortSnakeGenes } from "@/components/common/genetics/const";
import { GenePill, GenesSelect } from "@/components/common/genetics/geneSelect";
import { SexName } from "@/components/common/sexName";
import { calcProjGenes, categToConfig } from "@/components/common/utils";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { EClSt, IResClutch } from "@/api/breeding/models";
import { ECategories, EGenesView, IResSnakesList, categoryToBaseTable } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { useCalcMmOdds } from "@/api/misc/hooks";
import { notif } from "@/utils/notif";
import { declWord, urlProxyReplace } from "@/utils/other";
import { dateAddDays, dateTimeDiff, getAge, getDate, getDateObj } from "@/utils/time";
import { OddsGenesOnly } from "../../genetics/OddsCalc";
import { daysIncubation, getPercentage } from "../snakeBreed/breedUtils";
import { prepForMm, sexHardcode } from "../snakeBreed/common";
import { calcAnim } from "./clutchUtils";
import { IClutchEditScheme, statusHardcode } from "./common";

const sigBabyGenesId = signal<number | undefined>(undefined);

export const SParents = ({ clutch, onPicClick, className }: { clutch: IResClutch; onPicClick: Function; className?: string }) => {
  const names = [clutch.female_name].concat(clutch.males_names);
  const ids = [clutch.female_id].concat(clutch.males_ids);

  return (
    <Stack flex="1 1 auto">
      <Flex gap="xs" align="center">
        <Text size="sm" c="yellow.6">
          {clutch.id}
        </Text>
        <CopyButton value={clutch.id} timeout={3000}>
          {({ copied, copy }) => (
            <ActionIcon
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                copy();
              }}
              size="sm"
            >
              <IconSwitch icon={copied ? "check" : "copy"} width="14" height="14" style={{ stroke: "lime" }} />
            </ActionIcon>
          )}
        </CopyButton>
      </Flex>
      <Flex gap="xl" flex="1 1 auto" className={className} mih={176}>
        <Stack gap="md" justify="start" maw="100%" w="100%">
          {ids.map((a, ind) => (
            <Flex
              key={`${a}_${ind}_${clutch.id}`}
              mt={ind === 1 ? "auto" : 0}
              gap="sm"
              align="center"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onPicClick(ids[ind], ind === 0 ? "Самка" : "Самец");
              }}
            >
              <SexName sex={ind === 0 ? "female" : "male"} name={names[ind]} size="md" isLink />
            </Flex>
          ))}
        </Stack>
      </Flex>
    </Stack>
  );
};

export const SInfo = ({ clutch, category }: { clutch: IResClutch; category: ECategories }) => {
  const ids = clutch.finalised_ids;

  const isBc = category === ECategories["BC"];

  return (
    <Flex gap="xl" flex="0 1 520px">
      <Stack gap="md" flex={ids ? "1 0 290px" : "1 1 auto"}>
        <ClutchProgress laidDate={clutch.date_laid} hatchDate={clutch.date_hatch} curStatus={clutch.status} category={category} />
        <Flex gap="xl" wrap="nowrap">
          <Stack gap="xs">
            <Title order={6}>
              {isBc ? "Помёт всего" : "Яиц всего"}
              <Text size="sm" fw={500}>
                {clutch.eggs ?? "Не указано"}
              </Text>
            </Title>
          </Stack>
          <Stack gap="xs">
            <Title order={6}>
              Жировики
              <Text size="sm" fw={500}>
                {clutch.slugs ?? "Не указано"}
              </Text>
            </Title>
          </Stack>
          <Stack gap="xs">
            <Title order={6}>
              {isBc ? "Мертворожденные" : "Неоплоды"}
              <Text size="sm" fw={500}>
                {clutch.infertile_eggs ?? "Не указано"}
              </Text>
            </Title>
          </Stack>
        </Flex>
        <Stack gap="xs">
          <Title order={6}>Набор генов</Title>
          <Flex gap="4px" wrap="wrap">
            {calcProjGenes(clutch.female_genes.concat(clutch.male_genes.flat())).map((a, ind) => (
              <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="xs" />
            ))}
          </Flex>
        </Stack>
      </Stack>
      {ids ? (
        <Flex wrap="nowrap" direction="column" align="flex-start">
          <div>
            <Title order={6}>Змееныши</Title>
            <Space h="xs" />
          </div>
        </Flex>
      ) : null}
    </Flex>
  );
};

export const FinalJuveniles = ({ category, list, onPicClick }) => {
  const { data: juvs, isPending } = useSupaGet<IResSnakesList[]>({ t: categoryToBaseTable[category], f: (b) => b.filter("id", "in", `(${list})`), id: list }, true);
  return (
    <Flex wrap="nowrap" direction="column" align="flex-start">
      <div>
        <Title order={6}>Итоговые змееныши</Title>
        <Space h="xs" />
      </div>
      <Flex gap="md" wrap="wrap">
        {isPending ? (
          <Loader color="dark.1" size="sm" d="block" w="100%" />
        ) : (
          juvs?.map((juv) => (
            <Stack
              gap="xs"
              key={juv.id}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onPicClick(juv.id, null);
              }}
            >
              <Image src={urlProxyReplace(juv.picture)} fit="cover" radius="sm" w="100%" loading="lazy" mah={72} flex="1 1 0px" fallbackSrc={fallback} />
              <SexName sex={juv.sex} name={juv.snake_name} size="sm" />
            </Stack>
          ))
        )}
      </Flex>
    </Flex>
  );
};

export const ClutchProgress = ({ laidDate, hatchDate, curStatus, category, barOnly = false }) => {
  const left = dateTimeDiff(dateAddDays(laidDate, daysIncubation[category]), "days");
  const isHatch = curStatus === EClSt.HA;
  const isClosed = curStatus === EClSt.CL;

  const dateLabel = category === ECategories["BC"] ? "Дата" : "Дата кладки";
  const clutchEnd = category === ECategories["BC"] ? "Роды произошли" : "Кладка инкубирована";
  const tillEnd = category === ECategories["BC"] ? "До родов" : "До конца инкубации";

  return (
    <>
      {barOnly ? null : (
        <Flex gap="sm" justify="space-between">
          <Title order={6}>
            {dateLabel}
            <Text size="sm" fw={500}>
              {getDate(laidDate)}
            </Text>
          </Title>
          {(isHatch || isClosed) && hatchDate ? (
            <Title order={6} ta="right">
              {clutchEnd}
              <Text size="sm" fw={500}>
                {getDate(hatchDate)}
              </Text>
            </Title>
          ) : (
            <Title order={6} ta="right">
              Ожидаем
              <Text size="sm" fw={500}>
                ~{getDate(dateAddDays(laidDate, daysIncubation[category]))}
              </Text>
            </Title>
          )}
        </Flex>
      )}
      <Flex>
        <Box w="100%" maw="100%">
          <Progress.Root size="lg">
            <Progress.Section value={getPercentage(daysIncubation[category], left)} color={calcAnim(curStatus, left) ? "yellow" : "green"} animated={calcAnim(curStatus, left)} striped={curStatus === EClSt.LA} />
          </Progress.Root>
        </Box>
      </Flex>
      {(isHatch || isClosed) && hatchDate ? null : (
        <Flex justify="center">
          <Title order={6} fw={500}>
            {tillEnd} ~{declWord(left, ["день", "дня", "дней"])}
          </Title>
        </Flex>
      )}
    </>
  );
};

export const MiniInfo = ({ opened, close, snakeId, sex, category, withTitle = true }) => {
  const { data, isPending, isError } = useSupaGet<IResSnakesList>(categToConfig[category](snakeId), snakeId != null);
  const lastWeight = data?.weight?.sort((a, b) => getDateObj(a.date) - getDateObj(b.date))?.[data?.weight.length - 1];

  return (
    <Modal keepMounted={false} centered opened={opened} onClose={close} size="xs" title={withTitle && sex ? <Title order={4}>{sex} в кладке</Title> : undefined}>
      <Stack gap="md" mih={260}>
        {isPending ? (
          <Loader color="dark.1" size="lg" style={{ alignSelf: "center" }} />
        ) : isError ? (
          <Text fw={500} c="var(--mantine-color-error)">
            Не удалось подгрузить данные
          </Text>
        ) : (
          <>
            <Image src={data?.picture ? urlProxyReplace(data?.picture) : fallback} flex="1 1 0px" fit="cover" radius="md" w="auto" maw="100%" mih={110} mah={112} fallbackSrc={fallback} loading="lazy" />
            <Anchor href={`/snakes/${category}?id=${data.id}`} c="inherit">
              <SexName sex={data?.sex} name={data?.snake_name} isLink />
            </Anchor>
            <Text size="xs">⌛ {getAge(data?.date_hatch)}</Text>
            {lastWeight ? <Text size="xs">Вес {lastWeight.weight}г</Text> : null}
            <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
              {sortSnakeGenes(data.genes as any).map((a) => (
                <GenePill item={a} key={`${a.label}_${a.id}`} />
              ))}
            </Flex>
          </>
        )}
      </Stack>
    </Modal>
  );
};

export const FormApprovedBabies = ({ futureSnakes, isShow, category, femaleGenes, selectedFatherId }) => {
  const isMinSm = useMediaQuery(startSm);
  const isMinMd = useMediaQuery(startMd);
  const isMwTablet = useMediaQuery(tabletThreshold);
  const innerInstance = useFormContext<IClutchEditScheme>();
  const { errors } = innerInstance.formState;
  const { data: fatherData } = useSupaGet<IResSnakesList>(categToConfig[category](selectedFatherId), Boolean(selectedFatherId));
  const { mutate, data: oddsData, isError: isOddsErr, isPending: isOddPending } = useCalcMmOdds(category);

  useEffect(() => {
    if (!isEmpty(fatherData?.genes)) {
      mutate(
        { p1: prepForMm({ genes: femaleGenes } as any), p2: prepForMm({ genes: fatherData?.genes } as any) },
        {
          onError: async (err) => {
            notif({
              c: "red",
              t: "Ошибка",
              m: JSON.stringify(err),
              code: err.code || err.statusCode,
            });
          },
        },
      );
    }
  }, [selectedFatherId, mutate, JSON.stringify(fatherData?.genes)]);

  const renderItems = (ind, isLabel, size = "sm", withMargin = false) => {
    const isDefaultGenetics = isEmpty(innerInstance.getValues(`future_animals.${ind}.genes`)?.filter((d) => d.label !== "Normal"));
    return (
      <>
        <TextInput {...innerInstance.register(`future_animals.${ind}.snake_name`)} required={ind === 0} label={isLabel ? "Кличка змеи" : undefined} error={errors?.future_animals?.[ind]?.snake_name?.message} size={size} />
        <Controller
          name={`future_animals.${ind}.date_hatch`}
          control={innerInstance.control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <DateInput label={isLabel ? "Дата рождения" : undefined} value={new Date(value as any)} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" error={error?.message} maxDate={new Date()} size={size as any} />;
          }}
        />
        <Controller
          name={`future_animals.${ind}.sex`}
          control={innerInstance.control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select data={sexHardcode} value={value} onChange={onChange} label={isLabel ? "Пол" : undefined} error={error?.message} size={size} placeholder="Неопред" />;
          }}
        />
        <Controller
          name={`future_animals.${ind}.status`}
          control={innerInstance.control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <Select data={statusHardcode} value={value} onChange={onChange} label={isLabel ? "Состояние" : undefined} error={error?.message} size={size} />;
          }}
        />
        <Box maw="100%" style={{ alignSelf: "end" }}>
          {withMargin ? <Space h="xs" /> : null}
          <Button variant="default" onClick={() => (sigBabyGenesId.value = ind)} size="sm" w="100%" disabled={selectedFatherId == null} rightSection={isDefaultGenetics ? undefined : <IconSwitch icon="check" style={{ stroke: "lime", opacity: 0.6 }} />}>
            Генетика
          </Button>
        </Box>
        <Box>
          <Text size="xs" c="var(--mantine-color-error)">
            {errors?.future_animals?.[ind]?.genes?.message || ""}
          </Text>
        </Box>
      </>
    );
  };

  return !isEmpty(futureSnakes) && isShow ? (
    <>
      {isMinMd ? (
        futureSnakes.map((f, ind) => (
          <SimpleGrid cols={5} spacing="xs" verticalSpacing="xs" key={f.id}>
            {renderItems(ind, ind === 0, "sm")}
          </SimpleGrid>
        ))
      ) : (
        <Grid gutter="sm" align="baseline">
          {futureSnakes.map((f, ind) => (
            <Grid.Col key={f.id} span={isMinSm ? 3 : 4}>
              <Box>{renderItems(ind, true, "xs", true)}</Box>
            </Grid.Col>
          ))}
        </Grid>
      )}
      <Modal
        styles={{
          content: { overflow: "visible" },
        }}
        centered
        opened={sigBabyGenesId.value != null}
        onClose={() => (sigBabyGenesId.value = undefined)}
        size="xs"
        title={<Title order={5}>Выбор и корректировка генов</Title>}
      >
        <FormProvider {...innerInstance}>
          <BabyMorphSelect oddsData={oddsData} isOddPending={isOddPending} isError={isOddsErr} size={!isMwTablet ? "sm" : "xs"} category={category} ind={sigBabyGenesId.value} />
        </FormProvider>
      </Modal>
    </>
  ) : null;
};

const sigMethod = signal<"pre" | "manual">("manual");
const defGene = [{ label: "Normal", gene: "other", hasSuper: false, hasHet: false, id: -1 }];

const BabyMorphSelect = ({ oddsData, isOddPending, size, category, ind, isError }) => {
  const innerInstance = useFormContext<any>();
  const [wSaved] = useWatch({ control: innerInstance.control, name: [`future_animals.${ind}.genes`] });
  const [radio, setRadio] = useState<string | null>(null);

  const handleRadio = (a) => {
    setRadio(a);
    const dt = JSON.parse(a);
    const res = Array.isArray(dt) ? dt : [dt];
    innerInstance.setValue(`future_animals.${ind}.genes`, res);
  };

  const handleSwitch = (a) => {
    sigMethod.value = a;
    setRadio(null);
    innerInstance.setValue(`future_animals.${ind}.genes`, defGene);
  };

  useEffect(() => {
    if (wSaved != null && sigMethod.value === "pre") {
      setRadio(JSON.stringify(wSaved));
    }
  }, [sigMethod.value, wSaved]);

  return (
    <>
      <Stack gap="md">
        <SegmentedControl
          w="100%"
          maw="252px"
          size="xs"
          value={sigMethod.value}
          onChange={handleSwitch}
          data={[
            { label: "Из калькулятора", value: "pre", disabled: isError },
            { label: "Вручную", value: "manual" },
          ]}
          style={{ alignSelf: "center" }}
        />
        <Fieldset disabled={sigMethod.value === "pre"} legend={null} variant="unstyled">
          <Controller
            name={`future_animals.${ind}.genes`}
            control={innerInstance.control}
            render={({ field: { onChange, value } }) => {
              return <GenesSelect view={EGenesView.STD} description={null} onChange={onChange} init={value as any} category={category} size="sm" keepMounted={false} />;
            }}
          />
        </Fieldset>
        <Space h="sm" />
        <Fieldset disabled={sigMethod.value === "manual"} legend={null} variant="unstyled">
          <Stack>
            {isOddPending ? (
              <>
                <Text size="sm" style={{ alignSelf: "center" }}>
                  Загрузка калькулятора
                </Text>
                <Loader size="sm" style={{ alignSelf: "center" }} />
              </>
            ) : (
              oddsData?.offspring?.map((o) => {
                return <OddsGenesOnly o={o} key={o.morph_name} onChange={handleRadio} radioVal={radio} size={size} disabled={sigMethod.value === "manual"} />;
              })
            )}
          </Stack>
        </Fieldset>
      </Stack>
    </>
  );
};

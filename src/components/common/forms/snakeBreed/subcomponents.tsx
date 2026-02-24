import { FC } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { tabletThreshold } from "@/styles/theme";
import fallback from "@assets/placeholder.webp";
import { Accordion, Anchor, Box, Button, Divider, Drawer, Flex, Group, Image, Loader, LoadingOverlay, Menu, Modal, Progress, Select, Space, Stack, Text, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { Controller, FormProvider, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ButtonSelect } from "@/components/common/ButtonSelect";
import { OddsElement } from "@/components/common/genetics/OddsCalc";
import { sortSnakeGenes } from "@/components/common/genetics/const";
import { GenePill } from "@/components/common/genetics/geneSelect";
import { SexName } from "@/components/common/sexName";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, ESupaBreed, categoryToShort } from "@/api/common";
import { useSupaDel } from "@/api/hooks";
import { useCalcMmOdds } from "@/api/misc/hooks";
import { notif } from "@/utils/notif";
import { dateToSupabaseTime, getAge, getDateObj } from "@/utils/time";
import { calcEstimatedDate, calcTimeleft, daysAfterOvul, daysAfterShed, daysCriticalThr, getPercentage } from "./breedUtils";
import { IBreedScheme, eventsOpts, prepForMm, renderSelectOption, useUtilsBreed } from "./common";
import css from "./styles.module.scss";

export const MaleEvent = ({ id, disabled }) => {
  const { control } = useFormContext();
  const { fields, update, remove, replace } = useFieldArray<any, any, "id" | "event" | "date">({ name: `malesEvents.${id}`, control });
  const track = fields.map((a) => a.date);

  useEffect(() => {
    const sortedItems = [...fields].sort((a, b) => getDateObj(b.date) - getDateObj(a.date));
    replace(sortedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(track), replace]);

  return (
    <Stack gap="xs">
      {fields.map((f, ind, self) => (
        <Fragment key={f.id}>
          <Flex w="100%" maw="100%" gap="xs" wrap="nowrap">
            <Stack gap="xs" flex="1 0 114px">
              <Controller
                name={`malesEvents.${id}.${ind}.event`}
                control={control}
                render={({ field: { value }, fieldState: { error } }) => {
                  return (
                    <Select
                      disabled={disabled}
                      data={eventsOpts}
                      data-scroll-locked={0}
                      value={value as any}
                      error={error?.message}
                      onOptionSubmit={(v) => {
                        const cur = fields[ind];
                        update(ind, { ...cur, ...{ event: v } });
                      }}
                      size="xs"
                    />
                  );
                }}
              />
              <Controller
                name={`malesEvents.${id}.${ind}.date`}
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  return (
                    <>
                      <DatePickerInput
                        disabled={disabled}
                        value={value ? new Date(value) : value}
                        onChange={(v) => {
                          const tg = dateToSupabaseTime(v);
                          onChange(tg);
                          const cur = fields[ind];
                          update(ind, { ...cur, ...{ date: tg } });
                        }}
                        valueFormat="DD MMMM YYYY"
                        placeholder="Дата"
                        highlightToday
                        locale="ru"
                        error={error?.message}
                        maxDate={new Date()}
                        size="xs"
                      />
                    </>
                  );
                }}
              />
            </Stack>
            {disabled ? null : (
              <Flex justify="center" align="center" flex="1 0 auto" style={{ alignSelf: "center" }} onClick={() => remove(ind)}>
                <Box p="sm" style={{ opacity: 0.4, cursor: "pointer" }}>
                  <IconSwitch icon="bin" width="24" height="24" />
                </Box>
              </Flex>
            )}
          </Flex>
          {ind !== self.length - 1 ? <Divider w="100%" maw="100%" opacity={0.5} variant="dashed" /> : null}
        </Fragment>
      ))}
    </Stack>
  );
};

export const FemaleEvent = ({ isClutchMade, shed, ovul, category }) => {
  const { control, setValue } = useFormContext();

  return (
    <Stack w="100%" maw="100%" gap="sm">
      <Flex w="100%" maw="100%" gap="sm" align="center" className={css.wrapping}>
        <Text fw={500} flex="1 1 50%" size="xs">
          Предродовая линька
        </Text>
        <Controller
          name="female_prelay_shed_date"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput
                  disabled={isClutchMade}
                  rightSection={
                    value ? (
                      <div onClick={() => setValue("female_prelay_shed_date", null, { shouldDirty: true })} style={{ cursor: "pointer" }}>
                        <IconSwitch icon="bin" width="18" height="18" style={{ opacity: 0.4 }} />
                      </div>
                    ) : null
                  }
                  rightSectionPointerEvents="click"
                  size="xs"
                  value={value ? new Date(value) : value}
                  onChange={(b) => onChange(dateToSupabaseTime(b))}
                  valueFormat="DD MMMM YYYY"
                  placeholder="Дата"
                  highlightToday
                  locale="ru"
                  error={error?.message}
                  maxDate={new Date()}
                  flex="1 1 50%"
                />
              </>
            );
          }}
        />
      </Flex>

      <Flex w="100%" maw="100%" gap="sm" align="center" className={css.wrapping}>
        <Text fw={500} flex="1 1 50%" size="xs">
          Овуляция
        </Text>
        <Controller
          name="female_ovulation_date"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput
                  disabled={isClutchMade}
                  size="xs"
                  rightSection={
                    value ? (
                      <div
                        onClick={() => {
                          setValue("female_ovulation_date", null, { shouldDirty: true });
                          setValue("female_prelay_shed_date", null);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <IconSwitch icon="bin" width="18" height="18" style={{ opacity: 0.4 }} />
                      </div>
                    ) : null
                  }
                  value={value ? new Date(value) : value}
                  onChange={(b) => onChange(dateToSupabaseTime(b))}
                  valueFormat="DD MMMM YYYY"
                  placeholder="Дата"
                  highlightToday
                  locale="ru"
                  error={error?.message}
                  maxDate={new Date()}
                  flex="1 1 50%"
                />
              </>
            );
          }}
        />
      </Flex>
      {shed || ovul ? <TimeLeft shedDate={shed} ovulDate={ovul} category={category} /> : null}
    </Stack>
  );
};

const TimeLeft = ({ shedDate, ovulDate, category }) => {
  const { left, words } = calcTimeleft(category, ovulDate, shedDate);

  return (
    <Box>
      <Group gap="xs">
        <Flex justify="space-between" flex="1" wrap="wrap" gap="sm">
          <Text size="xs" fw={500}>
            {words}
          </Text>
          <Text size="xs" fw={500}>
            {calcEstimatedDate(category, ovulDate, shedDate)}
          </Text>
        </Flex>
        <Box w="100%" maw="100%">
          <Progress.Root size="lg">
            <Progress.Section value={shedDate ? getPercentage(daysAfterShed[category], left) : getPercentage(daysAfterOvul[category], left)} color={left > 0 ? "yellow" : "green"} animated={left > 0} striped={left > 0} />
          </Progress.Root>
        </Box>
      </Group>
    </Box>
  );
};

export const BriefInfo = ({ snake }) => {
  const lastWeight = snake?.weight?.sort((a, b) => getDateObj(a.date) - getDateObj(b.date))?.[snake?.weight.length - 1];

  return (
    <Stack>
      <Flex wrap="nowrap" gap="md" direction={{ base: "column", md: "row" }}>
        <Image src={snake?.picture} flex="1 1 0px" fit="cover" radius="md" w="auto" maw="100%" h={110} fallbackSrc={fallback} loading="lazy" />
        <Stack gap="xs" flex="0 1 auto">
          <SexName sex={snake?.sex} name={snake?.snake_name} />
          <Text size="xs">⌛ {getAge(snake?.date_hatch)}</Text>
          {lastWeight ? <Text size="xs">Вес {lastWeight.weight}г</Text> : null}
        </Stack>
      </Flex>
      <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
        {sortSnakeGenes(snake?.genes as any)?.map((a) => <GenePill item={a} key={`${a.label}_${a.id}`} />)}
      </Flex>
    </Stack>
  );
};

export const OddsInfo = ({ female, male, category }) => {
  const isMwTablet = useMediaQuery(tabletThreshold);
  const [isOpen, setOpen] = useState(false);
  const { mutate, data, isPending, isError } = useCalcMmOdds(category);

  useEffect(() => {
    if (female != null && male != null) {
      mutate({ p1: prepForMm(female), p2: prepForMm(male) });
    }
  }, [female, male, mutate]);

  if (isPending)
    return (
      <>
        <Space h="md" />
        <Loader color="dark.1" size="sm" d="block" w="100%" />
      </>
    );
  if (isError || !data) return null;

  return isMwTablet ? (
    <>
      <Space h="sm" />
      <Drawer opened={isOpen} onClose={() => setOpen(false)} title="Возможные комбинации" offset="calc(16px + env(safe-area-inset-top))" position="top">
        <Stack gap="lg" pt="xs">
          {data?.offspring?.map((o) => {
            return <OddsElement o={o} key={o.morph_name} />;
          })}
        </Stack>
      </Drawer>
      <Button variant="default" onClick={() => setOpen(true)} size="compact-xs">
        Возможные комбинации
      </Button>
    </>
  ) : (
    <Accordion variant="separated" radius="md" mt="md">
      <Accordion.Item value="combos">
        <Accordion.Control fz="xs">Возможные комбинации</Accordion.Control>
        <Accordion.Panel>
          <Group gap="lg">
            {data?.offspring?.map((o) => {
              return <OddsElement o={o} key={o.morph_name} />;
            })}
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

type ICltForm = {
  existingClutchId?: string | null;
  onSub: (a?: any) => void;
  onFinalize: (a?: any) => void;
  btnText?: string;
  category: ECategories;
};

export const FormComposedBody: FC<ICltForm> = ({ onSub, btnText = "Сохранить", onFinalize, category, existingClutchId }) => {
  const innerInstance = useFormContext<IBreedScheme>();

  const selectedFem = useWatch({
    control: innerInstance.control,
    name: "female_id",
  });
  const malesEvents = useWatch({
    control: innerInstance.control,
    name: "malesEvents",
  });
  const [wOvul, wShed] = useWatch({ control: innerInstance.control, name: ["female_ovulation_date", "female_prelay_shed_date"] });

  const {
    fields: fetchFields,
    append: appendFetch,
    update: updateFetch,
    remove: removeFetch,
  } = useFieldArray<any, any, "id" | "snake">({
    control: innerInstance.control,
    name: "males_ids",
  });

  const { isListPen, isQuePen, isAddAllowed, femData, malesData, regFems, regMales } = useUtilsBreed({ fem: selectedFem, fetchFields, category });

  const isClutchMade = innerInstance.getValues("breed_status") === "clutch" && existingClutchId != null;

  const { left } = calcTimeleft(category, wOvul, wShed);

  return (
    <>
      {isListPen || isQuePen ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      <Group maw="100%" w="100%" align="start" gap="xl" grow>
        <Flex gap="md" justify="flex-start" align="flex-start" direction="column" wrap="nowrap">
          <Text size="md">Самка для проекта</Text>
          <Controller
            name="female_id"
            control={innerInstance.control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <Select data={regFems} value={value} onChange={onChange} error={error?.message} required disabled={isClutchMade} />;
            }}
          />
          <Box w="100%" maw="100%">
            {selectedFem ? (
              <>
                {!regFems?.map((a) => a.label).includes(femData?.snake_name) ? (
                  <>
                    <Text size="sm" fw={500}>
                      Эта самка больше не у вас
                    </Text>
                    <Space h="sm" />
                  </>
                ) : null}
                <BriefInfo snake={femData} />
                <Space h="md" />
                <FormProvider {...innerInstance}>
                  <FemaleEvent isClutchMade={isClutchMade} ovul={wOvul} shed={wShed} category={category} />
                </FormProvider>
              </>
            ) : null}
          </Box>
        </Flex>
        <Flex gap="md" justify="flex-start" align="flex-start" direction="column" wrap="nowrap">
          <Text size="md">Самцы для проекта</Text>
          <Stack align="flex-start" w="100%" maw="100%">
            <Controller
              name={`males_ids.0.snake`}
              control={innerInstance.control}
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                return (
                  <Select
                    searchable
                    renderOption={(o) => renderSelectOption(o.option, fetchFields?.find((f) => f.snake === o.option.value) != null)}
                    data={regMales}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    onOptionSubmit={(v) => {
                      updateFetch(0, { snake: v });
                    }}
                    required
                    disabled={isClutchMade}
                  />
                );
              }}
            />
            {malesData?.map((male, ind) => (
              <Fragment key={male?.id}>
                <Box style={{ width: "100%", maxWidth: "100%" }}>
                  {!regMales?.map((a) => a.label).includes(male?.snake_name) ? (
                    <>
                      <Text size="sm" fw={500}>
                        Этот самец больше не у вас
                      </Text>
                      <Space h="sm" />
                    </>
                  ) : null}
                  <BriefInfo snake={male} />
                  <Space h="md" />
                  {isClutchMade ? null : (
                    <>
                      <ButtonSelect
                        options={eventsOpts}
                        label="Добавить событие"
                        handleSelect={(v) => {
                          const newArr = [
                            {
                              event: v,
                              date: null,
                            },
                          ].concat(malesEvents?.[male?.id] || []);
                          innerInstance.setValue(`malesEvents.${male?.id}` as any, newArr);
                        }}
                      />
                      <Space h="md" />
                    </>
                  )}
                  <FormProvider {...innerInstance}>{malesEvents && malesEvents.hasOwnProperty(male?.id) ? <MaleEvent id={male?.id} disabled={isClutchMade} /> : null}</FormProvider>
                  {category !== ECategories.MV ? <OddsInfo female={femData} male={male} category={category} /> : null}
                  <div>
                    {fetchFields?.slice(1)[ind] != null ? (
                      <Group justify="space-between">
                        {ind >= 0 ? <Divider my="lg" w="100%" /> : null}
                        <Controller
                          name={`males_ids.${ind + 1}.snake`}
                          control={innerInstance.control}
                          render={({ fieldState: { error } }) => {
                            return (
                              <Select
                                disabled={isClutchMade}
                                searchable
                                renderOption={(o) => renderSelectOption(o.option, fetchFields?.find((f) => f.snake === o.option.value) != null)}
                                data={regMales}
                                value={fetchFields?.[ind + 1]?.snake}
                                error={error?.message}
                                comboboxProps={{
                                  onOptionSubmit: (v) =>
                                    fetchFields?.find((f) => f.snake === v) != null
                                      ? notif({
                                          c: "red",
                                          t: "Ошибка",
                                          m: "Этот самец уже выбран в данном проекте",
                                        })
                                      : updateFetch(ind + 1, { snake: v }),
                                }}
                              />
                            );
                          }}
                        />
                        <Button size="compact-xs" onClick={() => removeFetch(ind + 1)} disabled={isClutchMade}>
                          Удалить
                        </Button>
                      </Group>
                    ) : null}
                  </div>
                </Box>
              </Fragment>
            ))}
            {isAddAllowed && !isClutchMade ? (
              <Box style={{ alignSelf: "flex-end" }}>
                <Space h="md" />
                <Button size="compact-xs" right={0} onClick={() => appendFetch({ snake: undefined })}>
                  Добавить самца
                </Button>
              </Box>
            ) : null}
          </Stack>
        </Flex>
      </Group>
      {innerInstance.formState.errors?.["malesEvents"] ? <span>{JSON.stringify(innerInstance.formState.errors?.["malesEvents"].message)}</span> : null}
      <Flex gap="xl" align="center" mt="lg" maw="100%" w="100%">
        <Button type="submit" onClick={innerInstance.handleSubmit(onSub)} disabled={!innerInstance.formState.isDirty || isClutchMade} size="xs" ml="auto">
          {btnText}
        </Button>
        {left <= daysCriticalThr && !isClutchMade ? (
          <Button type="submit" onClick={innerInstance.handleSubmit(onFinalize)} variant="gradient" gradient={{ from: "violet", to: "orange", deg: 90 }} size="xs">
            Зарегистрировать кладку
          </Button>
        ) : isClutchMade ? (
          <div>
            Уже есть кладка{" "}
            <Anchor href={`/clutches/edit/${category}?id=${innerInstance.getValues("clutch_id" as any)}`} style={{ textDecoration: "underline" }}>
              Перейти
            </Anchor>
          </div>
        ) : null}
      </Flex>
    </>
  );
};

export const BreedControl = ({ children, id, onDelete, clutchId, category }) => {
  return (
    <Menu
      trigger="click-hover"
      openDelay={200}
      shadow="md"
      width={164}
      transitionProps={{ transition: "rotate-left", duration: 150 }}
      loop={false}
      trapFocus={false}
      menuItemTabIndex={0}
      position="right-end"
      offset={8}
      withArrow
      arrowPosition="center"
      closeOnClickOutside
      keepMounted={false}
      zIndex={30}
    >
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component="a" href={`/breeding/${category}?id=${id}`}>
          К проекту
        </Menu.Item>
        {clutchId ? (
          <Menu.Item component="a" href={`/clutches/edit/${category}?id=${clutchId}`}>
            Посмотреть кладку
          </Menu.Item>
        ) : null}
        <Menu.Item c="var(--mantine-color-error)" onClick={() => onDelete(id)}>
          Удалить
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const BreedDelete = ({ opened, close, breedId, category }) => {
  const cat = categoryToShort[category];
  const { mutate, isPending } = useSupaDel(ESupaBreed[`${cat?.toUpperCase()}_BREED`], {
    qk: [ESupaBreed[`${cat.toUpperCase()}_BREED_V`]],
    e: false,
  });

  const handleDel = () =>
    mutate(
      { id: breedId },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "План проекта удалён" });
          close();
        },
        onError: async (err) => {
          notif({
            c: "red",
            t: "Не удалось удалить план",
            m: JSON.stringify(err),
            code: err.code || err.statusCode,
          });
        },
      },
    );
  return (
    <Modal centered opened={opened} onClose={close} size="sm" title={<Title order={5}>Удаление проекта</Title>} ta="center">
      <Title component="span" c="var(--mantine-color-error)" order={4}>
        Внимание!
      </Title>
      <Space h="xs" />
      <Text>
        Все данные проекта будут утеряны без возможности восстановления
        <br />
        Вы уверены?
      </Text>
      <Space h="xl" />
      <Flex gap="xl" justify="center" w="100%" maw="100%">
        <Button variant="default" onClick={close}>
          Отмена
        </Button>
        <Button variant="filled" color="var(--mantine-color-error)" onClick={handleDel} loading={isPending} disabled={isPending}>
          Удалить
        </Button>
      </Flex>
    </Modal>
  );
};

import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { tabletThreshold } from "@/styles/theme";
import fallback from "@assets/placeholder.png";
import { Accordion, ActionIcon, Box, Button, Divider, Drawer, Flex, Group, Image, Loader, LoadingOverlay, Menu, Modal, Progress, Select, Space, Stack, Text, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { Controller, FormProvider, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ButtonSelect } from "@/components/common/ButtonSelect";
import { SexName } from "@/components/common/sexName";
import { fromMMtoPill, sortBpGenes } from "@/components/genetics/const";
import { GenePill } from "@/components/genetics/geneSelect";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useCalcOdds, useDeleteBpBreed } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { dateToSupabaseTime, getAge } from "@/utils/time";
import { calcEstimatedDate, calcTimeleft, daysAfterOvul, daysAfterShed, getPercentage } from "./breedUtils";
import { eventsOpts, prepForMm, renderSelectOption, useUtilsBreed } from "./common";

export const MaleEvent = ({ id }) => {
  const { control } = useFormContext();
  const { fields, update, remove } = useFieldArray({ name: `malesEvents.${id}`, control });

  return (
    <Stack gap="sm">
      {fields?.map((f, ind) => (
        <Flex key={f.id} w="100%" maw="100%" gap="sm" wrap="nowrap">
          <Controller
            name={`malesEvents.${id}.${ind}.event`}
            control={control}
            render={({ field: { value }, fieldState: { error } }) => {
              return (
                <Select
                  data={eventsOpts}
                  data-scroll-locked={0}
                  value={value as any}
                  error={error?.message}
                  onOptionSubmit={(v) => {
                    const cur = fields[ind];
                    update(ind, { ...cur, ...{ event: v } });
                  }}
                  flex="1 0 114px"
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
                    value={value ? new Date(value) : value}
                    onChange={(v) => {
                      onChange(v);
                      const cur = fields[ind];
                      update(ind, { ...cur, ...{ date: v } });
                    }}
                    valueFormat="DD MMMM YYYY"
                    placeholder="Дата"
                    highlightToday
                    locale="ru"
                    error={error?.message}
                    maxDate={new Date()}
                    flex="1 1 50%"
                    size="xs"
                  />
                </>
              );
            }}
          />
          <div style={{ flex: "1 0 auto", alignSelf: "center", color: "red", cursor: "pointer" }} onClick={() => remove(ind)}>
            <IconSwitch icon="bin" width="24" height="24" />
          </div>
        </Flex>
      ))}
    </Stack>
  );
};

export const FemaleEvent = () => {
  const { control, setValue } = useFormContext();
  const [wOvul, wShed] = useWatch({ control, name: ["female_ovulation_date", "female_prelay_shed_date"] });

  return (
    <Stack w="100%" maw="100%" gap="sm">
      <Flex w="100%" maw="100%" gap="sm" wrap="nowrap" align="center">
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
                  rightSection={
                    value ? (
                      <div onClick={() => setValue("female_prelay_shed_date", null, { shouldDirty: true })} style={{ cursor: "pointer" }}>
                        <IconSwitch icon="bin" width="18" height="18" />
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

      <Flex w="100%" maw="100%" gap="sm" wrap="nowrap" align="center">
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
                        <IconSwitch icon="bin" width="18" height="18" />
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

      {wShed || wOvul ? <TimeLeft shedDate={wShed} ovulDate={wOvul} /> : null}
    </Stack>
  );
};

const TimeLeft = ({ shedDate, ovulDate }) => {
  const { left, words } = calcTimeleft(ovulDate, shedDate);

  return (
    <Box>
      <Group gap="xs">
        <Flex justify="space-between" flex="1" wrap="wrap" gap="sm">
          <Text size="xs" fw={500}>
            {words}
          </Text>
          <Text size="xs" fw={500}>
            {calcEstimatedDate(ovulDate, shedDate)}
          </Text>
        </Flex>
        <Box w="100%" maw="100%">
          <Progress.Root size="lg">
            <Progress.Section value={shedDate ? getPercentage(daysAfterShed, left) : getPercentage(daysAfterOvul, left)} color="green" animated striped />
          </Progress.Root>
        </Box>
      </Group>

      {left <= 5 ? (
        <>
          <Space h="md" />
          <Button variant="gradient" gradient={{ from: "violet", to: "orange", deg: 90 }} size="xs">
            Зарегистрировать кладку
          </Button>
        </>
      ) : null}
    </Box>
  );
};

export const BriefInfo = ({ snake }) => (
  <Stack>
    <Flex wrap="nowrap" gap="md" direction={{ base: "column", md: "row" }}>
      <Image src={snake?.picture} flex="0 0 0px" fit="cover" radius="md" w="auto" maw="100%" h={110} fallbackSrc={fallback} loading="lazy" />
      <Stack gap="xs" flex="0 1 auto">
        <SexName sex={snake?.sex} name={snake?.snake_name} />
        <Text size="md">⌛ {getAge(snake?.date_hatch)}</Text>
      </Stack>
    </Flex>
    <Flex gap="sm" style={{ flexFlow: "row wrap" }}>
      {sortBpGenes(snake?.genes as any)?.map((a) => <GenePill item={a} key={`${a.label}_${a.id}`} />)}
    </Flex>
  </Stack>
);

export const OddsInfo = ({ female, male }) => {
  const isMwTablet = useMediaQuery(tabletThreshold);
  const [isOpen, setOpen] = useState(false);
  const { mutate, data, isPending, isError } = useCalcOdds();

  useEffect(() => {
    if (female != null && male != null) {
      mutate({ p1: prepForMm(female), p2: prepForMm(male) });
    }
  }, [female, male, mutate]);

  if (isPending) return <Loader color="dark.1" size="lg" d="block" w="100%" />;
  if (isError || !data) return null;

  return isMwTablet ? (
    <>
      <Space h="sm" />
      <Drawer opened={isOpen} onClose={() => setOpen(false)} title="Возможные комбинации" offset={24} position="top">
        <Group gap="lg" pt="xs">
          {data?.offspring?.map((o) => {
            const { numerator, denominator } = o.probability;
            return (
              <Flex key={o.morph_name} direction="row" wrap="nowrap" gap="xs">
                <Box fz="xs" flex={{ base: "1 0 auto", sm: "1 0 72px" }}>{`${numerator}/${denominator} (${(numerator / denominator) * 100}%)`}</Box>
                <Flex direction="row" wrap="wrap" gap="sm">
                  {o.traits.map((t) => (
                    <GenePill key={`${t.id}_${t.name}`} item={fromMMtoPill(t)} />
                  ))}
                </Flex>
              </Flex>
            );
          })}
        </Group>
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
              const { numerator, denominator } = o.probability;
              return (
                <Flex key={o.morph_name} direction="row" wrap="nowrap" gap="md">
                  <Box fz="xs" flex="1 0 72px">{`${numerator}/${denominator} (${(numerator / denominator) * 100}%)`}</Box>
                  <Flex direction="row" wrap="wrap" gap="sm">
                    {o.traits.map((t) => (
                      <GenePill key={`${t.id}_${t.name}`} item={fromMMtoPill(t)} />
                    ))}
                  </Flex>
                </Flex>
              );
            })}
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export const FormComposedBody = ({ owned_bp_list, onSub, btnText = "Сохранить" }) => {
  const innerInstance = useFormContext();

  const selectedFem = useWatch({
    control: innerInstance.control,
    name: "female_id",
  });
  const malesEvents = useWatch({
    control: innerInstance.control,
    name: "malesEvents",
  });

  const {
    fields: fetchFields,
    append: appendFetch,
    update: updateFetch,
    remove: removeFetch,
  } = useFieldArray<any, any, "id" | "snake">({
    control: innerInstance.control,
    name: "males_ids",
  });

  const { isListPen, isQuePen, isAddAllowed, femData, malesData, regFems, regMales } = useUtilsBreed({ owned_bp_list, fem: selectedFem, fetchFields });

  return (
    <>
      {isListPen || isQuePen ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      <Group maw="100%" w="100%" align="start" gap="xl" grow>
        <Flex gap="md" justify="flex-start" align="flex-start" direction="column" wrap="nowrap">
          <Text size="lg" mb="xs">
            Самка для проекта
          </Text>
          <Controller
            name="female_id"
            control={innerInstance.control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <Select data={regFems} value={value} onChange={onChange} error={error?.message} required />;
            }}
          />
          <Box w="100%" maw="100%">
            {femData ? (
              <>
                <BriefInfo snake={femData} />
                <Space h="md" />
                <FormProvider {...innerInstance}>
                  <FemaleEvent />
                </FormProvider>
              </>
            ) : null}
          </Box>
        </Flex>
        <Flex gap="md" justify="flex-start" align="flex-start" direction="column" wrap="nowrap">
          <Text size="lg" mb="xs">
            Самцы для проекта
          </Text>
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
                  />
                );
              }}
            />
            {malesData?.map((male, ind) => (
              <Fragment key={male?.id}>
                <Box style={{ width: "100%", maxWidth: "100%" }}>
                  <BriefInfo snake={male} />
                  <Space h="md" />
                  <ButtonSelect
                    options={eventsOpts}
                    label="Добавить событие"
                    handleSelect={(v) => {
                      const newArr = [
                        ...(malesEvents?.[male?.id] || []),
                        {
                          event: v,
                          date: null,
                        },
                      ];
                      innerInstance.setValue(`malesEvents.${male?.id}` as any, newArr);
                    }}
                  />
                  <Space h="md" />
                  <FormProvider {...innerInstance}>{malesEvents && malesEvents.hasOwnProperty(male?.id) ? <MaleEvent id={male?.id} /> : null}</FormProvider>
                  <OddsInfo female={femData} male={male} />
                  <div>
                    {fetchFields?.slice(1)[ind] != null ? (
                      <Group justify="space-between">
                        {ind >= 0 ? <Divider my="lg" w="100%" /> : null}
                        <Controller
                          name={`males_ids.${ind + 1}.snake`}
                          control={innerInstance.control}
                          render={({ field: { onChange, value }, fieldState: { error } }) => {
                            return (
                              <Select
                                searchable
                                renderOption={(o) => renderSelectOption(o.option, fetchFields?.find((f) => f.snake === o.option.value) != null)}
                                data={regMales}
                                value={value}
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
                        <Button size="compact-xs" onClick={() => removeFetch(ind + 1)}>
                          Удалить
                        </Button>
                      </Group>
                    ) : null}
                  </div>

                  {isAddAllowed ? (
                    <Box pos="relative" mt="md">
                      <Button size="compact-sm" pos="absolute" right={0} onClick={() => appendFetch({ snake: undefined })}>
                        Добавить самца
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              </Fragment>
            ))}
          </Stack>
        </Flex>
      </Group>
      {innerInstance.formState.errors?.["malesEvents"] ? <span>{JSON.stringify(innerInstance.formState.errors?.["malesEvents"].message)}</span> : null}
      <Button type="submit" onClick={innerInstance.handleSubmit(onSub)} mt="lg" disabled={!innerInstance.formState.isDirty}>
        {btnText}
      </Button>
    </>
  );
};

export const ControlMenu = ({ id, onDelete }) => {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon size="sm" variant="transparent" color="gray" aria-label="Table Action Kebab">
          <IconSwitch icon="kebab" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item component="a" href={`/breeding/ballpython?id=${id}`}>
          К планированию
        </Menu.Item>
        <Menu.Item onClick={() => onDelete(id)}>Удалить</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const BreedDelete = ({ opened, close, breedId }) => {
  const { mutate, isPending } = useDeleteBpBreed();

  const handleDel = () =>
    mutate(breedId, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "План удалён" });
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
    });
  return (
    <Modal centered opened={opened} onClose={close} size="sm" title={<Title order={3}>Удаление проекта</Title>}>
      <Text>
        Внимание! Все данные проекта будут утеряны <br />
        Уверены, что хотите удалить?
      </Text>
      <Space h="xl" />
      <Flex gap="xl" justify="center" w="100%" maw="100%">
        <Button variant="default" onClick={close} size="compact-sm" loading={isPending}>
          Нет
        </Button>
        <Button onClick={handleDel} size="compact-sm" loading={isPending}>
          Да
        </Button>
      </Flex>
    </Modal>
  );
};

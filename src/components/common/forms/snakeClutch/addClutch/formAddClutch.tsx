import { useLocation } from "preact-iso";
import { FC, Fragment } from "preact/compat";
import { useEffect } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Divider, Flex, Group, LoadingOverlay, NumberInput, Progress, Select, Space, Stack, Text, Textarea, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { GenePill } from "@/components/common/genetics/geneSelect";
import { calcProjGenes } from "@/components/common/utils";
import { Btn } from "@/components/navs/btn/Btn";
import { EClSt, ICreateClutchReq } from "@/api/breeding/models";
import { ECategories, ESupaBreed, categoryToShort } from "@/api/common";
import { useSupaCreate } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff } from "@/utils/time";
import { daysIncubation, getPercentage } from "../../snakeBreed/breedUtils";
import { renderSelectOption, useUtilsBreed } from "../../snakeBreed/common";
import { BriefInfo } from "../../snakeBreed/subcomponents";
import { calcAnim } from "../clutchUtils";
import { IClutchAddScheme, clutchAddSchema, initClutchAddValues, prepForClutchCreate } from "../common";
import { MiniInfo } from "../subcomponents";

const snakeId = signal<string | undefined>(undefined);

interface IProp {
  category: ECategories;
}
export const FormAddClutch: FC<IProp> = ({ category }) => {
  const location = useLocation();
  const cat = categoryToShort[category];
  const {
    handleSubmit,
    formState: { isDirty },
    control,
    register,
  } = useForm<IClutchAddScheme>({
    defaultValues: initClutchAddValues,
    resolver: yupResolver(clutchAddSchema as any),
  });

  const [selectedFem, wDate] = useWatch({
    control,
    name: ["female_id", "date_laid"],
  });

  const {
    fields: fetchFields,
    append: appendFetch,
    update: updateFetch,
    remove: removeFetch,
  } = useFieldArray<any, any, "id" | "snake">({
    control,
    name: "males_ids",
  });

  const { isListPen, isQuePen, isAddAllowed, femData, malesData, regFems, regMales } = useUtilsBreed({ fem: selectedFem, fetchFields, category });
  const { mutate, isPending } = useSupaCreate<ICreateClutchReq>(ESupaBreed[`${cat.toUpperCase()}_CL`], { qk: [ESupaBreed[`${cat.toUpperCase()}_CL_V`]], e: false });

  const left = dateTimeDiff(dateAddDays(wDate, daysIncubation[category]), "days");

  const onCreate = async (sbm: IClutchAddScheme) => {
    mutate(prepForClutchCreate(sbm), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Кладка зарегистрирована" });
        location.route("/clutches");
      },
      onError: async (err) => {
        notif({
          c: "red",
          t: "Ошибка",
          m: JSON.stringify(err),
          code: err.code || err.statusCode,
        });
      },
    });
  };

  useEffect(() => {
    return () => {
      snakeId.value = undefined;
    };
  }, []);

  return (
    <>
      {isListPen || isQuePen ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      <Text size="md" fw={500} c="yellow.6">
        Создание кладки
      </Text>
      <Group maw="100%" w="100%" align="start" gap="xl" grow>
        <Flex gap="md" justify="flex-start" align="flex-start" direction="column" wrap="nowrap">
          <Text size="md">Самка</Text>
          <Controller
            name="female_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <Select data={regFems} value={value} onChange={onChange} error={error?.message} required />;
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
              </>
            ) : null}
          </Box>
        </Flex>
        <Flex gap="md" justify="flex-start" align="flex-start" direction="column" wrap="nowrap">
          <Text size="md">Самец или Самцы</Text>
          <Stack align="flex-start" w="100%" maw="100%">
            <Controller
              name={`males_ids.0.snake`}
              control={control}
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
                  {!regMales?.map((a) => a.label).includes(male?.snake_name) ? (
                    <>
                      <Text size="sm" fw={500}>
                        Этот самец больше не у вас
                      </Text>
                      <Space h="sm" />
                    </>
                  ) : null}
                  <BriefInfo snake={male} />
                  <div>
                    {fetchFields?.slice(1)[ind] != null ? (
                      <Group justify="space-between">
                        {ind >= 0 ? <Divider my="lg" w="100%" /> : null}
                        <Controller
                          name={`males_ids.${ind + 1}.snake`}
                          control={control}
                          render={({ fieldState: { error } }) => {
                            return (
                              <Select
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
                        <Button size="compact-xs" onClick={() => removeFetch(ind + 1)}>
                          Удалить
                        </Button>
                      </Group>
                    ) : null}
                  </div>
                </Box>
              </Fragment>
            ))}
            {isAddAllowed && fetchFields.filter((a) => a).length >= 1 ? (
              <Box style={{ alignSelf: "flex-end" }}>
                <Space h="md" />
                <Button size="compact-xs" right={0} onClick={() => appendFetch({})}>
                  Добавить самца
                </Button>
              </Box>
            ) : null}
          </Stack>
        </Flex>
      </Group>
      {!isEmpty(femData) && !isEmpty(malesData?.filter((a) => a)) ? (
        <Stack gap="xs">
          <Title order={6}>Гены в проекте</Title>
          <Flex gap="4px" wrap="wrap">
            {calcProjGenes(femData?.genes.concat((malesData ?? [])?.map((m) => m?.genes)?.flat())).map((a, ind) => (
              <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="sm" />
            ))}
          </Flex>
        </Stack>
      ) : null}
      <Stack maw="100%" w="100%" gap="lg">
        <Flex maw="100%" w="100%" gap="xl" align="end" direction={{ base: "column", xs: "row" }}>
          <Controller
            name="date_laid"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <DatePickerInput label="Дата кладки" w={{ base: "100%", xs: "50%" }} flex="1 1 50%" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" error={error?.message} maxDate={new Date()} />;
            }}
          />
          <Stack w={{ base: "100%", xs: "50%" }} flex="1 1 50%">
            {wDate ? (
              <>
                <Flex>
                  <Box w="100%" maw="100%">
                    <Progress.Root size="lg">
                      <Progress.Section value={getPercentage(daysIncubation[category], left)} color={calcAnim(EClSt.LA, left) ? "yellow" : "green"} animated={calcAnim(EClSt.LA, left)} striped={calcAnim(EClSt.LA, left)} />
                    </Progress.Root>
                  </Box>
                </Flex>
                <Flex justify="center">
                  <Title order={6}>{`До конца инкубации ~${declWord(left, ["день", "дня", "дней"])}`}</Title>
                </Flex>
              </>
            ) : null}
          </Stack>
        </Flex>
        <Flex gap="lg" wrap="wrap">
          <Controller
            name="eggs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput label="Яиц всего" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} required allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
          <Controller
            name="slugs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput label="Жировики" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} required allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
          <Controller
            name="infertile_eggs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput label="Неоплоды" onChange={onChange} value={value as any} allowDecimal={false} allowNegative={false} allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
        </Flex>
        <Box maw="100%" w="100%">
          <Textarea {...register("notes")} label="Заметки" resize="vertical" w="100%" maw="100%" id="txarea_helper_clutch" />
        </Box>
      </Stack>
      <Flex align="flex-start" maw="100%" w="100%">
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onCreate)} disabled={!isDirty || isPending} loading={isPending}>
          Создать
        </Btn>
      </Flex>
      <MiniInfo
        opened={snakeId.value != null}
        close={() => {
          snakeId.value = undefined;
        }}
        snakeId={snakeId.value}
        sex={null}
        withTitle={false}
        category={category}
      />
    </>
  );
};

import { useLocation } from "preact-iso";
import { FC } from "preact/compat";
import { useEffect } from "preact/hooks";
import fallback from "@assets/placeholder.png";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Divider, Flex, Image, NumberInput, Progress, Select, Stack, Text, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { calcProjGenes } from "@/components/ballpythons/const";
import { GenePill } from "@/components/genetics/geneSelect";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { useFinaliseBpClutch, useUpdateBpClutch } from "@/api/hooks";
import { EClSt, IResBpClutch } from "@/api/models";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { dateAddDays, dateTimeDiff } from "@/utils/time";
import { daysAfterLaid, daysCriticalThr, getPercentage } from "../../bpBreed/breedUtils";
import { calcAnim } from "../clutchUtils";
import { FormApprovedBabies, Juveniles, MiniInfo } from "../subcomponents";
import { IClutchScheme, clutchSchema, prepForFinal, prepForHatch, prepForUpdate, stdErr } from "./const";
import style from "./styles.module.scss";

const snakeId = signal<string | undefined>(undefined);

// FIXME Условия отображения кнопок и компонентов
interface IProp {
  clutch: IResBpClutch;
  initData: IClutchScheme;
  fathersToPick: any[];
}
export const FormEditClutch: FC<IProp> = ({ initData, clutch, fathersToPick }) => {
  const location = useLocation();
  const form = useForm<IClutchScheme>({
    defaultValues: initData,
    resolver: yupResolver(clutchSchema as any),
  });

  const {
    handleSubmit,
    formState: { isDirty, dirtyFields },
    control,
    watch,
  } = form;

  const [wEggs, wInf] = useWatch({
    control,
    name: ["eggs", "infertile_eggs"],
  });

  const { fields: kidsFields, replace } = useFieldArray({
    control,
    name: "placeholders",
  });

  const { fields: futureSnakes, replace: replaceInit } = useFieldArray({
    control,
    name: "future_animals",
  });

  const pics = [clutch.female_picture].concat(clutch.male_pictures);
  const ids = [clutch.female_id].concat(clutch.males_ids);
  const { female_genes, male_genes } = clutch;

  const { mutate: update } = useUpdateBpClutch(clutch.id);
  const { mutate: finalise } = useFinaliseBpClutch(clutch.id);

  const dateLaid = watch("date_laid");
  const left = dateTimeDiff(dateAddDays(dateLaid, daysAfterLaid), "days");
  const isLaid = clutch.status === EClSt.LA;
  const isHatch = clutch.status === EClSt.HA;
  const isClosed = clutch.status === EClSt.CL;
  const isCanHatch = dateTimeDiff(dateAddDays(clutch.date_laid, daysAfterLaid), "days") <= daysCriticalThr;

  const onSub = async (sbm) => {
    update(prepForUpdate(sbm, dirtyFields, location.query.id), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Детали кладки обновлены" });
        location.route("/clutches");
      },
      onError: async (err) => {
        stdErr(err);
      },
    });
  };

  const onHatch = (sbm) => {
    update(prepForHatch(sbm, dirtyFields, location.query.id), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Поздравляем с рождением малышей! 🥳" });
      },
      onError: async (err) => {
        stdErr(err);
      },
    });
  };

  const onFinalise = (sbm) => {
    finalise(prepForFinal(sbm, location.query.id) as any, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Змейки зарегистрированы" });
      },
      onError: async (err) => {
        stdErr(err);
      },
    });
  };

  useEffect(() => {
    if (isLaid) {
      replace(new Array(wEggs - (wInf ?? 0)).fill(" "));
    }
  }, [wEggs, wInf, isLaid, replace]);

  useEffect(() => {
    if (initData.future_animals != null && isHatch) {
      replaceInit(initData.future_animals);
    }
  }, [initData.future_animals, replaceInit, isHatch]);

  useEffect(() => {
    return () => {
      snakeId.value = undefined;
    };
  }, []);

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Просмотр и редактирование кладки {location.query.id}
      </Text>
      <Flex maw="100%" w="100%" gap="lg" wrap="wrap">
        {pics?.map((a, ind) => (
          <Flex key={a} gap="sm" flex="0 1 160px" h={80} style={{ cursor: "pointer" }} onClick={() => (snakeId.value = ids?.[ind])} wrap="nowrap">
            <IconSwitch icon={ind === 0 ? "female" : "male"} width="16" height="16" />
            <Image src={a} fit="cover" radius="sm" w="auto" flex="0 0 160px" loading="lazy" fallbackSrc={fallback} />
          </Flex>
        ))}
      </Flex>
      <Stack gap="xs">
        <Title order={6}>Гены в проекте</Title>
        <Flex gap="4px" wrap="wrap">
          {calcProjGenes(female_genes.concat(male_genes.flat())).map((a, ind) => (
            <GenePill key={`${a.label}_${a.gene}_${ind}`} item={a as any} size="sm" />
          ))}
        </Flex>
      </Stack>
      <Stack maw="100%" w="100%" gap="lg">
        <Flex maw="100%" w="100%" gap="xl" align="end" direction={{ base: "column", xs: "row" }}>
          <Controller
            name="date_laid"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <DatePickerInput
                  disabled={isHatch || isClosed}
                  label="Дата кладки"
                  w={{ base: "100%", xs: "50%" }}
                  flex="1 1 50%"
                  value={value as any}
                  onChange={onChange}
                  valueFormat="DD MMMM YYYY"
                  highlightToday
                  locale="ru"
                  error={error?.message}
                  maxDate={new Date()}
                />
              );
            }}
          />
          <Stack w={{ base: "100%", xs: "50%" }} flex="1 1 50%">
            <Flex>
              <Box w="100%" maw="100%">
                <Progress.Root size="lg">
                  <Progress.Section value={getPercentage(daysAfterLaid, left)} color="green" animated={calcAnim(clutch.status, left)} striped={calcAnim(clutch.status, left)} />
                </Progress.Root>
              </Box>
            </Flex>
            <Flex justify="center">
              <Title order={6}>{isHatch || isClosed ? "Кладка инкубирована" : `До конца инкубации ~${declWord(left, ["день", "дня", "дней"])}`}</Title>
            </Flex>
          </Stack>
        </Flex>
        <Flex gap="lg" wrap="wrap">
          <Controller
            name="eggs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput disabled={isHatch || isClosed} label="Яйца" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} required allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
          <Controller
            name="slugs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput disabled={isHatch || isClosed} label="Жировики" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} required allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
          <Controller
            name="infertile_eggs"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return <NumberInput disabled={isHatch || isClosed} label="Неоплоды" onChange={onChange} value={value} allowDecimal={false} allowNegative={false} allowLeadingZeros={false} min={0} max={99} clampBehavior="strict" error={error?.message} />;
            }}
          />
        </Flex>
      </Stack>
      {!(isHatch || isClosed) ? (
        <Flex align="flex-start" maw="100%" w="100%">
          <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} disabled={!isDirty}>
            Сохранить изменения
          </Btn>
        </Flex>
      ) : null}
      {isCanHatch ? (
        <>
          <Divider w="100%" maw="100%" mt="md" />
          <Stack gap="lg" w="100%" maw="100%">
            <Flex gap="md">
              <Controller
                name="date_hatch"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  return (
                    <DatePickerInput
                      disabled={isHatch || isClosed}
                      label="Дата завершения инкубации"
                      w="auto"
                      maw="max-content"
                      value={value as any}
                      onChange={onChange}
                      valueFormat="DD MMMM YYYY"
                      highlightToday
                      locale="ru"
                      error={error?.message}
                      maxDate={dateAddDays(value as any, 5).toDate()}
                      minDate={dateAddDays(value as any, -5).toDate()}
                    />
                  );
                }}
              />
              <Controller
                name="father_id"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  return <Select searchable label="Отработавший самец" data={fathersToPick} value={value} onChange={onChange} error={error?.message} disabled={clutch.males_ids.length === 1} />;
                }}
              />
            </Flex>

            {isLaid && !isClosed ? (
              <>
                <Flex gap="md" className={style.animated} wrap="wrap">
                  {kidsFields?.map((a) => (
                    <Flex key={a.id} gap="sm" wrap="nowrap" miw="0px" mih="0px">
                      <IconSwitch icon="unisex" width="20" height="20" />
                      <Image src={null} fit="cover" radius="sm" w="auto" h={48} loading="lazy" flex="1 1 48px" fallbackSrc={fallback} />
                    </Flex>
                  ))}
                </Flex>
                <Flex align="flex-start" maw="100%" w="100%">
                  <Button type="submit" onClick={handleSubmit(onHatch)} variant="gradient" gradient={{ from: "violet", to: "orange", deg: 90 }} size="sm">
                    Завершить инкубацию
                  </Button>
                </Flex>
              </>
            ) : null}

            <FormProvider {...form}>
              <FormApprovedBabies futureSnakes={futureSnakes} isClosed={isClosed} />
            </FormProvider>
          </Stack>
          {clutch.males_ids.length > 1 && !isClosed ? (
            <Title component="span" c="yellow.6" order={5} fw={400}>
              Мы рекомендуем завершить кладку и сохранить всех ювенилов, когда вы определились с их морфингом, а, значит, и с тем, какой самец отработал. На данный момент записать отцом можно только одного самца.
            </Title>
          ) : null}

          {!isLaid && !isClosed ? (
            <Flex align="flex-start" maw="100%" w="100%">
              <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onFinalise)}>
                Завершить кладку
              </Btn>
            </Flex>
          ) : null}
        </>
      ) : null}

      {isClosed ? (
        !isEmpty(clutch.finalised_ids) ? (
          <Juveniles ids={clutch.finalised_ids} onPicClick={(i) => (snakeId.value = i)} title="Итоговые змееныши в кладке" />
        ) : (
          <Text fw={400} c="var(--mantine-color-error)">
            Кладка завершена, но невозможно отобразить змеенышей.
            <br />
            Вероятно, данные по ним были удалены, либо же — из кладки никто не вышел 😭
          </Text>
        )
      ) : null}

      {isClosed && !isEmpty(clutch.finalised_ids) ? <Juveniles ids={clutch.finalised_ids} onPicClick={(i) => (snakeId.value = i)} title="Итоговые змееныши в кладке" /> : null}

      <MiniInfo
        opened={snakeId.value != null}
        close={() => {
          snakeId.value = undefined;
        }}
        snakeId={snakeId.value}
        sex={null}
        withTitle={false}
      />
    </>
  );
};

import { FC } from "preact/compat";
import { yupResolver } from "@hookform/resolvers/yup";
import { Accordion, Box, Checkbox, Flex, Modal, NumberInput, Popover, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Feeder } from "@/components/common/Feeder/Feeder";
import { codeToFeeder } from "@/components/common/Feeder/const";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, ESupabase, IFeedMassReq, IReqUpdViv, IResSnakesList, IVivRes } from "@/api/common";
import { useSupaGet, useSupaMassUpd, useSupaUpd } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";
import { declWord } from "@/utils/other";
import { notif } from "../../../../utils/notif";
import { getDate, getDateObj } from "../../../../utils/time";
import { Btn } from "../../../navs/btn/Btn";
import { snakeStatusToColor, snakeStatusToLabel } from "../../Market/utils";
import { SexName } from "../../sexName";
import { categToDeclTitle } from "../../utils";
import { prepVivUpd } from "../Vivarium/const";
import { calcSchema, defVals, prepareForSubmit } from "./const";

type IProp = {
  opened: boolean;
  close: () => void;
  snakes: IResSnakesList[] | undefined;
  table: ESupabase;
  category: ECategories;
  onSucc: Function;
};

export const FeedSnakesUniversal: FC<IProp> = ({ opened, close, snakes, table, category, onSucc }) => {
  const userId = localStorage.getItem("USER");
  const { data: profile } = useProfile(userId, userId != null);
  const [isPop, func] = useDisclosure(false);
  const { mutate, isPending } = useSupaMassUpd<IFeedMassReq>({
    t: table,
  });
  const { data: viv, isError } = useSupaGet<IVivRes>({ t: ESupabase.VIV, f: (b) => b.eq("owner_id", userId).limit(1).single(), id: userId }, userId != null);
  const { mutate: updViv } = useSupaUpd<IReqUpdViv>(ESupabase.VIV);

  const title = declWord(5, categToDeclTitle[category], true, true);
  const filtered = snakes?.filter((f) => f.status !== "archived");
  const idsToUpdate = filtered?.map((h) => h?.id);
  const isDisabled = filtered?.length === 0;

  const lastFeed = filtered && filtered?.length > 1 ? undefined : filtered?.[0]?.feeding?.sort((a, b) => getDateObj(a.feed_last_at!) - getDateObj(b.feed_last_at!))?.[filtered?.[0]?.feeding.length - 1];
  const lastWeight = filtered && filtered?.length > 1 ? undefined : filtered?.[0]?.weight?.sort((a, b) => getDateObj(a.date) - getDateObj(b.date))?.[filtered?.[0]?.weight.length - 1];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    defaultValues: defVals,
    resolver: yupResolver(calcSchema(Boolean(profile?.is_vivarium_on)) as any),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const isCln = useWatch({ name: "isClean", control });

  const fullClose = () => {
    reset();
    close();
  };

  const onSub = async (sbm) => {
    const { feed, mass, shed, ko_cat } = prepareForSubmit(sbm);

    mutate(
      {
        upd: (filtered ?? []).map((b) => ({
          ...(mass ? { weight: (b?.weight ?? []).concat(mass) } : {}),
          ...(feed ? { feeding: (b?.feeding ?? []).concat(feed) } : {}),
          ...(shed ? { shed: (b?.shed ?? []).concat(shed) } : {}),
          ...(category === ECategories.BP ? { pre_id: b.pre_id } : { id: b.id }),
          last_action: "update",
        })) as any,
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Событие добавлено" });
          fullClose();
          onSucc();
          if (profile?.is_vivarium_on && !isError && viv?.[ko_cat ?? ""]) {
            const kek = prepVivUpd(viv, feed?.feed_weight!, ko_cat!, idsToUpdate?.length) as any;
            if (kek != null)
              updViv(
                {
                  id: viv.id,
                  upd: kek,
                },
                {
                  onSuccess: () => {
                    notif({ c: "cyan", t: "Успешно", m: "Виварий актуализирован" });
                  },
                  onError: (e) => {
                    notif({ c: "red", t: "Вивариум не обновлен", m: e.message, code: e.code });
                  },
                },
              );
          }
        },
        onError: (err) => {
          notif({
            c: "red",
            m: err.message,
            code: err.code || err.statusCode,
          });
        },
      },
    );
  };

  const errObj = errors?.["shed"] || errors?.["refuse"] || errors?.["regurgitation"];

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={fullClose}
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
      lockScroll={false}
      title={
        <Title order={4}>
          {title}. {filtered && filtered?.length > 1 ? "Массовое событие" : "Событие"}
        </Title>
      }
    >
      {isDisabled ? (
        <Text component="span" size="sm">
          Ваш массовый выбор змей содержит только статус{" "}
          <Text fw={500} size="md" c={snakeStatusToColor["archived"]} component="span">
            {snakeStatusToLabel["archived"]}
          </Text>{" "}
          , для него нельзя вносить какие-либо изменения в информацию. Скорректируйте выборку до змей в статусе{" "}
          <Text fw={500} size="md" c={snakeStatusToColor["collection"]} component="span">
            {snakeStatusToLabel["collection"]}
          </Text>{" "}
          , либо снимите все чекбосы и работайте с каждой змеей индивидуально.
        </Text>
      ) : (
        <Flex gap="xs" maw="100%" w="100%" wrap="wrap">
          {filtered?.map((a) => <SexName sex={a.sex!} name={a.snake_name ?? ""} key={a?.id} size={filtered?.length > 1 ? "xs" : "md"} />)}
        </Flex>
      )}
      <Space h="sm" />
      <Flex w="100%" gap="md">
        <Controller
          name="feed_last_at"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <DatePickerInput
                label="Дата"
                required
                value={value}
                onChange={onChange}
                valueFormat="DD MMMM YYYY"
                highlightToday
                locale="ru"
                placeholder="Не выбрана"
                maxDate={new Date()}
                error={error?.message}
                flex="1 1 50%"
                popoverProps={{
                  position: "bottom",
                  middlewares: { flip: false, shift: true },
                }}
              />
            );
          }}
        />
        <Controller
          name="weight"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <NumberInput
                suffix=" г"
                allowLeadingZeros={false}
                rightSection={
                  <Popover width={200} position="top" withArrow shadow="md" opened={isPop} offset={{ mainAxis: 18, crossAxis: -80 }}>
                    <Popover.Target>
                      <Box onMouseEnter={func.open} onMouseLeave={func.close} onClick={() => setValue("isClean", !isCln)} style={{ cursor: "pointer" }}>
                        <IconSwitch icon="clean" width="18" height="18" style={{ stroke: isCln ? "#ff9f40" : "" }} />
                      </Box>
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }} p="xs">
                      <Text size="xs">Активно, если масса "чистая" без экскреции </Text>
                    </Popover.Dropdown>
                  </Popover>
                }
                rightSectionPointerEvents="auto"
                value={value as any}
                onChange={onChange}
                label="Масса питомца"
                placeholder="Не заполнено"
                hideControls
                error={error?.message}
                allowDecimal={false}
                allowNegative={false}
                flex="1 1 50%"
              />
            );
          }}
        />
      </Flex>
      <Space h="sm" />
      <Flex rowGap="lg" columnGap="md" wrap="nowrap">
        <Checkbox label="Линька" value="true" {...(register("shed") as any)} />
        <Checkbox label="Отказ" value="true" {...register("refuse")} />
        <Checkbox label="Срыг" value="true" {...register("regurgitation")} />
      </Flex>
      {errObj != null ? (
        <>
          <Space h="xs" />
          <Text size="xs" c="var(--mantine-color-error)">
            {errObj.message}
          </Text>
        </>
      ) : null}
      <Space h="lg" />
      <Controller
        name="feed_ko"
        control={control}
        render={({ field: { onChange }, fieldState: { error } }) => {
          return <Feeder onChange={onChange} errMsg={error?.message} />;
        }}
      />
      <Space h="lg" />
      <Controller
        name="feed_weight"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <NumberInput
              onChange={onChange}
              value={value as any}
              suffix=" г"
              label="Масса КО"
              placeholder="Не заполнено"
              hideControls
              error={error?.message}
              allowDecimal={false}
              w={{ base: "100%", xs: "50%" }}
              allowLeadingZeros={false}
              allowNegative={false}
            />
          );
        }}
      />
      <Space h="lg" />
      <TextInput {...register("feed_comment")} label="Коммент к событию" error={errors?.["feed_comment"]?.message} />
      {lastFeed || lastWeight ? (
        <>
          <Space h="lg" />
          <Accordion variant="separated" radius="xl">
            <Accordion.Item value={"kek"}>
              <Accordion.Control>
                <Text size="sm">Последние актуальные данные</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Flex justify="space-between" gap="md">
                    <Text size="sm">Дата: {lastFeed?.feed_last_at ? `${getDate(lastFeed.feed_last_at!)}` : "Нет данных"}</Text>
                    <Text size="sm" ta="right">
                      Масса питомца: {lastWeight?.weight ? `${lastWeight?.weight}г` : "Нет данных"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" gap="md">
                    <Text size="sm" flex="1 1 50%">
                      Кормовой объект:
                      {lastFeed?.feed_ko ? codeToFeeder(lastFeed.feed_ko) : "Нет данных"}
                    </Text>
                    <Text size="sm" flex="1 1 50%" ta="right">
                      Вес КО: {lastFeed?.feed_weight ? `${lastFeed.feed_weight}г` : "Нет данных"}
                    </Text>
                    {lastFeed?.regurgitation ? (
                      <Text size="sm" c="var(--mantine-color-error)">
                        Срыг
                      </Text>
                    ) : null}
                    {lastFeed?.refuse ? (
                      <Text size="sm" c="#00FFC0">
                        Отказ от еды
                      </Text>
                    ) : null}
                  </Flex>
                  <Text size="sm">Комментарий: {lastFeed?.feed_comment ? lastFeed.feed_comment : "Пусто"}</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </>
      ) : null}
      <Space h="lg" />
      <Flex>
        <Btn type="submit" ml="auto" size="xs" onClick={handleSubmit(onSub)} loading={isPending} disabled={isDisabled || isPending}>
          Подтвердить
        </Btn>
      </Flex>
    </Modal>
  );
};

import { FC } from "preact/compat";
import { yupResolver } from "@hookform/resolvers/yup";
import { Accordion, Checkbox, Flex, Modal, NumberInput, Select, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm } from "react-hook-form";
import { useUpdateFeeding } from "@/api/hooks";
import { IResSnakesList } from "@/api/models";
import { notif } from "../../../utils/notif";
import { getDate } from "../../../utils/time";
import { SexName } from "../../common/sexName";
import { Btn } from "../../navs/btn/Btn";
import { feederHardcode, feederToString } from "../addBp/const";
import { defVals, prepareForSubmit, schema } from "./const";

type IProp = {
  opened: boolean;
  close: () => void;
  snake?: IResSnakesList;
};

export const FeedSnake: FC<IProp> = ({ opened, close, snake }) => {
  const lastFeed = snake?.feeding?.[snake?.feeding.length - 1];
  const lastWeight = snake?.weight?.[snake?.weight.length - 1];
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: defVals,
    resolver: yupResolver(schema as any),
  });

  const fullClose = () => {
    reset();
    close();
  };

  const { mutate, isPending } = useUpdateFeeding();

  const onSub = async (sbm) => {
    const { feed, mass, shed } = prepareForSubmit(sbm);

    mutate(
      { id: snake?.id!, feed, mass, shed },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Кормление добавлено" });
          fullClose();
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

  return (
    <Modal opened={opened} onClose={fullClose} centered transitionProps={{ transition: "fade", duration: 200 }} lockScroll={false} title={<Title order={3}>Новое событие</Title>}>
      <Flex gap="sm" align="center">
        <Text size="sm">Кормление, взвешивание, линька региуса</Text>
        <SexName sex={snake?.sex!} name={snake?.snake_name ?? ""} />
      </Flex>
      <Space h="sm" />
      <Flex rowGap="lg" columnGap="md" align="end">
        <Controller
          name="feed_last_at"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <DatePickerInput label="Дата" required value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" placeholder="Не выбрана" maxDate={new Date()} error={error?.message} style={{ flex: "1 1 auto" }} />;
          }}
        />
        <Checkbox label="Линька" {...(register("shed") as any)} />
      </Flex>
      {errors?.["shed"]?.message ? (
        <>
          <Space h="xs" />
          <Text size="xs" c="var(--mantine-color-error)">
            {errors?.["shed"]?.message}
          </Text>
        </>
      ) : null}
      <Space h="lg" />
      <NumberInput {...(register("weight") as any)} name="weight" rightSection="г" label="Масса питомца" placeholder="Нет заполнено" hideControls error={errors?.["weight"]?.message} />
      <Space h="lg" />
      <Controller
        name="feed_ko"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <Select data={feederHardcode} data-scroll-locked={0} value={value} onChange={onChange} label="Кормовой объект" error={error?.message} placeholder="Нет данных" />;
        }}
      />
      <Space h="lg" />
      <NumberInput {...(register("feed_weight") as any)} rightSection="г" label="Масса КО" placeholder="Не выбрано" hideControls error={errors?.["feed_weight"]?.message} />
      <Space h="lg" />
      <TextInput {...register("feed_comment")} label="Коммент к кормлению" error={errors?.["feed_comment"]?.message} />
      <Space h="lg" />
      <Accordion variant="separated" radius="xl" defaultValue="Apples">
        <Accordion.Item value={"kek"}>
          <Accordion.Control>Предыдущее кормление</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Flex justify="space-between">
                <Text size="sm">Масса питомца: {lastWeight?.weight ? `${lastWeight?.weight}г` : "Нет данных"}</Text>
                <Text size="sm">Дата: {lastFeed?.feed_last_at ? `${getDate(lastFeed.feed_last_at!)}` : "Нет данных"}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm">Кормовой объект: {lastFeed?.feed_ko ? feederToString[lastFeed.feed_ko] : "Нет данных"}</Text>
                <Text size="sm">Вес КО: {lastFeed?.feed_weight ? `${lastFeed.feed_weight}г` : "Нет данных"}</Text>
              </Flex>
              <Text size="sm">Комментарий: {lastFeed?.feed_comment ? lastFeed.feed_comment : "Пусто"}</Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Space h="lg" />
      <Btn type="submit" size="xs" onClick={handleSubmit(onSub)} loading={isPending}>
        Подтвердить
      </Btn>
    </Modal>
  );
};

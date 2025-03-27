import { FC } from "preact/compat";
import { yupResolver } from "@hookform/resolvers/yup";
import { Accordion, Flex, Modal, NumberInput, Select, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm } from "react-hook-form";
import { useUpdateFeeding } from "@/api/hooks";
import { IResSnakesList } from "@/api/models";
import { notif } from "../../utils/notif";
import { getDate } from "../../utils/time";
import { SexName } from "../common/sexName";
import { feederHardcode, reverseFeeder } from "../forms/addBp/const";
import { Btn } from "../navs/btn/Btn";
import { defVals, schema } from "./const";

const feederToString = reverseFeeder(feederHardcode);
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

  const { mutate, isPending } = useUpdateFeeding();

  const onSub = async (sbm) => {
    mutate(
      { id: snake?.id!, feeding: sbm },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Кормление добавлено" });
          reset();
          close();
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
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={3}>Новое кормление</Title>}>
      <Flex gap="sm" align="center">
        <Text>Кормим региуса</Text>
        <SexName sex={snake?.sex!} name={snake?.snake_name ?? ""} />
      </Flex>

      <Space h="sm" />
      <NumberInput {...(register("weight") as any)} name="weight" rightSection="г" label="Масса питомца" placeholder="Нет заполнено" hideControls />
      <Space h="lg" />
      <Controller
        name="feed_last_at"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <>
              <DatePickerInput label="Дата кормления" required value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" placeholder="Не выбрана" maxDate={new Date()} />
              {error ? <span>{error?.message}</span> : null}
            </>
          );
        }}
      />
      <Space h="lg" />
      <Controller
        name="feed_ko"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <Select data={feederHardcode} value={value} onChange={onChange} label="Кормовой объект" error={error?.message} placeholder="Не выбран" />;
        }}
      />
      <Space h="lg" />
      <NumberInput {...(register("feed_weight") as any)} rightSection="г" label="Масса КО" placeholder="Не выбрано" hideControls />
      <Space h="lg" />
      <TextInput {...register("feed_comment")} label="Коммент к кормлению" error={errors?.feed_comment} />
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

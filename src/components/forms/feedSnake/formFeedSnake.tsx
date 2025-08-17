import { FC } from "preact/compat";
import { yupResolver } from "@hookform/resolvers/yup";
import { Accordion, Box, Checkbox, Flex, Modal, NumberInput, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm } from "react-hook-form";
import { Feeder } from "@/components/common/Feeder/Feeder";
import { codeToFeeder } from "@/components/common/Feeder/const";
import { useUpdateFeeding } from "@/api/hooks";
import { IResSnakesList } from "@/api/models";
import { notif } from "../../../utils/notif";
import { getDate } from "../../../utils/time";
import { SexName } from "../../common/sexName";
import { Btn } from "../../navs/btn/Btn";
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
    mode: "onSubmit",
    reValidateMode: "onChange",
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
          notif({ c: "green", t: "Успешно", m: "Событие добавлено" });
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

  const errObj = errors?.["shed"] || errors?.["refuse"] || errors?.["regurgitation"];

  return (
    <Modal size="lg" opened={opened} onClose={fullClose} centered transitionProps={{ transition: "fade", duration: 200 }} lockScroll={false} title={<Title order={3}>Региус. Новое событие</Title>}>
      <Box>
        <SexName sex={snake?.sex!} name={snake?.snake_name ?? ""} />
      </Box>
      <Space h="sm" />
      <Flex w="100%" gap="md">
        <Controller
          name="feed_last_at"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <DatePickerInput label="Дата" required value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" highlightToday locale="ru" placeholder="Не выбрана" maxDate={new Date()} error={error?.message} flex="1 1 50%" />;
          }}
        />
        <NumberInput {...(register("weight") as any)} name="weight" rightSection="г" label="Масса питомца" required placeholder="Не заполнено" hideControls error={errors?.["weight"]?.message} allowDecimal={false} flex="1 1 50%" />
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
      <NumberInput {...(register("feed_weight") as any)} rightSection="г" label="Масса КО" placeholder="Не выбрано" hideControls error={errors?.["feed_weight"]?.message} allowDecimal={false} w={{ base: "100%", xs: "50%" }} />
      <Space h="lg" />
      <TextInput {...register("feed_comment")} label="Коммент к событию" error={errors?.["feed_comment"]?.message} />
      <Space h="lg" />
      <Accordion variant="separated" radius="xl" defaultValue="Apples">
        <Accordion.Item value={"kek"}>
          <Accordion.Control>Предыдущая запись</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Flex justify="space-between" gap="md">
                <Text size="sm">Дата: {lastFeed?.feed_last_at ? `${getDate(lastFeed.feed_last_at!)}` : "Нет данных"}</Text>
                <Text size="sm">Масса питомца: {lastWeight?.weight ? `${lastWeight?.weight}г` : "Нет данных"}</Text>
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
      <Space h="lg" />
      <Flex>
        <Btn type="submit" size="xs" onClick={handleSubmit(onSub)} loading={isPending} ml="auto">
          Подтвердить
        </Btn>
      </Flex>
    </Modal>
  );
};

import { Fragment } from "preact/jsx-runtime";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Divider, Flex, Modal, NumberInput, Space, Stack, Text, Title } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { Controller, FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { SexName } from "@/components/common/sexName";
import { Btn } from "@/components/navs/btn/Btn";
import { useCreateReminder, useDeleteReminder, useSnakeQueue } from "@/api/hooks";
import { IRemindersRes, IResSnakesList } from "@/api/models";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { dateAddDays, dateToSupabaseTime, getDate, getIsSame } from "@/utils/time";
import { getSnakesInReminder, makeSubmit } from "./const";
import { sigCurDate, sigIsModOpen, sigSelected } from "./signals";

export const Reminder = ({ reminders, allSnakes, close }: { reminders: IRemindersRes[]; allSnakes: IResSnakesList[]; close: () => void }) => {
  const formInstance = useForm<any>({
    defaultValues: {},
    resolver: yupResolver({} as any),
  });

  const cur: IRemindersRes[] = reminders?.filter((a) => getIsSame(a.scheduled_time, sigCurDate.value));
  const { forCreate } = makeSubmit(
    sigSelected.value,
    reminders
      .map((c) => c.snake_ids)
      .flat()
      .filter((a) => a != null),
  );

  const { mutate, isPending } = useDeleteReminder();
  const { mutate: makeNew } = useCreateReminder();
  const { data: infoList } = useSnakeQueue(forCreate);

  const closeAndRes = () => {
    close();
    formInstance.reset();
  };

  const handleCreate = (payload) => {
    makeNew(payload, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Напоминание создано" });
        closeAndRes();
      },
      onError: async (err) => {
        notif({
          c: "red",
          t: "Не удалось создать напоминание",
          m: JSON.stringify(err),
          code: err.code || err.statusCode,
        });
      },
    });
  };

  const del = (id) => {
    mutate(id, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Напоминание удалено" });
        closeAndRes();
      },
      onError: async (err) => {
        notif({
          c: "red",
          t: "Не удалось удалить напоминание",
          m: JSON.stringify(err),
          code: err.code || err.statusCode,
        });
      },
    });
  };

  return (
    <Modal centered opened={sigIsModOpen.value} onClose={closeAndRes} size="xs" title={sigCurDate.value ? <Title order={5}>{getDate(sigCurDate.value)}</Title> : null}>
      {sigCurDate.value ? (
        <div>
          {!isEmpty(cur) ? (
            <>
              {cur.map((rem, ind, self) => (
                <Fragment key={rem.id}>
                  <Stack gap="sm">
                    <Text size="sm">{getIsSame(new Date(), sigCurDate.value) ? "Сегодня по плану кормление для" : "Активное напоминание о кормлении для"}</Text>
                    <Flex wrap="wrap" rowGap={"xs"} columnGap={"sm"}>
                      {getSnakesInReminder(rem, allSnakes)?.map((c) => <SexName key={c?.id} sex={c?.sex!} name={c?.snake_name ?? ""} size="sm" inline={false} />)}
                    </Flex>
                    <Text size="sm">{rem.repeat_interval ? `Периодичность — ${declWord(rem.repeat_interval, ["день", "дня", "дней"])}` : "Единоразово"}</Text>
                    {rem.repeat_interval ? <Text size="sm">Следующее напоминание {getDate(dateAddDays(rem.scheduled_time, rem.repeat_interval))}</Text> : null}
                    <Flex>
                      <Button variant="filled" color="var(--mantine-color-error)" onClick={() => del(rem.id)} loading={isPending} size="xs" ml="auto">
                        Удалить
                      </Button>
                    </Flex>
                  </Stack>
                  {ind !== self.length - 1 ? <Divider w="100%" maw="100%" mb="md" mt="sm" /> : null}
                </Fragment>
              ))}
              {!isEmpty(sigSelected.value) ? (
                <>
                  <Divider w="100%" maw="100%" mb="md" mt="sm" />
                  {isEmpty(forCreate) ? (
                    <Text size="sm">Для создания нового напоминания на эту дату, нужно выбрать хотя бы одну Змею, для которой еще не существует напоминания</Text>
                  ) : (
                    <FormProvider {...formInstance}>
                      <CreateRem list={infoList} handleCreate={handleCreate} creationIds={forCreate} />
                    </FormProvider>
                  )}
                </>
              ) : null}
            </>
          ) : (
            <>
              {isEmpty(sigSelected.value) ? (
                <>
                  <Text size="md">Нет напоминаний</Text>
                  <Space h="md" />
                  <Text size="sm">Выберите в таблице змей, для которых хотите создать напоминание о кормлении. В этот день вам придет push с перечнем питомцев.</Text>
                </>
              ) : (
                <>
                  {isEmpty(forCreate) ? (
                    <Text size="sm">Для создания нового напоминания на эту дату, нужно выбрать хотя бы одну Змею, для которой еще не существует напоминания</Text>
                  ) : (
                    <FormProvider {...formInstance}>
                      <CreateRem list={infoList} handleCreate={handleCreate} creationIds={forCreate} />
                    </FormProvider>
                  )}
                </>
              )}
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

const CreateRem = ({ list, handleCreate, creationIds }) => {
  const innerInstance = useFormContext<any>();
  const userId = localStorage.getItem("USER");

  const wInt = useWatch({
    control: innerInstance.control,
    name: "interval",
  });

  return (
    <Stack>
      <Text size="sm">Создать напоминание для:</Text>
      <Flex wrap="wrap" gap="sm">
        {list?.map((c) => <SexName key={c?.id} sex={c?.sex!} name={c?.snake_name ?? ""} size="sm" inline={false} />)}
      </Flex>
      <Controller
        name="interval"
        control={innerInstance.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <NumberInput
              label={wInt ? "С периодичностью" : "Единоразово"}
              onChange={onChange}
              value={value || 0}
              defaultValue={undefined}
              suffix={wInt ? ` ${declWord(wInt, ["день", "дня", "дней"], true)}` : undefined}
              allowDecimal={false}
              allowNegative={false}
              allowLeadingZeros={false}
              min={0}
              max={99}
              clampBehavior="strict"
              error={error?.message}
            />
          );
        }}
      />

      <Btn
        fullWidth={false}
        w="min-content"
        style={{ alignSelf: "end" }}
        onClick={() =>
          handleCreate({
            owner_id: userId!,
            scheduled_time: dateToSupabaseTime(sigCurDate.value),
            repeat_interval: innerInstance.getValues("interval"),
            snake_ids: creationIds,
          })
        }
      >
        Создать
      </Btn>
    </Stack>
  );
};

import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Flex, Modal, NumberInput, Space, Stack, Text, Title } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { Controller, useForm, useWatch } from "react-hook-form";
import { SexName } from "@/components/common/sexName";
import { Btn } from "@/components/navs/btn/Btn";
import { useCreateReminder, useDeleteReminder, useSnakeQueue } from "@/api/hooks";
import { IRemindersRes, IResSnakesList } from "@/api/models";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { dateAddDays, dateToSupabaseTime, getDate, getIsSame } from "@/utils/time";
import { calcExisting, makeSubmit } from "./const";
import { sigCurDate, sigIsModOpen, sigSelected } from "./signals";

export const Reminder = ({ reminders, allSnakes, close }: { reminders: IRemindersRes[]; allSnakes: IResSnakesList[]; close: () => void }) => {
  const userId = localStorage.getItem("USER");
  const { control, getValues } = useForm<any>({
    defaultValues: {},
    resolver: yupResolver({} as any),
  });

  const wInt = useWatch({
    control,
    name: "interval",
  });

  const cur = reminders?.find((a) => getIsSame(a.scheduled_time, sigCurDate.value));
  const existing = calcExisting(cur, allSnakes);
  const { forCreate } = makeSubmit(sigSelected.value, existing ? existing?.filter((s) => !isEmpty(s)).map((b) => b!.id) : null);

  const { mutate, isPending } = useDeleteReminder();
  const { mutate: makeNew } = useCreateReminder();
  const { data: infoList } = useSnakeQueue(forCreate);

  const createRem = (payload) => {
    makeNew(payload, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Напоминание создано" });
        close();
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

  const del = () => {
    mutate(cur?.id!, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Напоминание удалено" });
        close();
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
    <Modal centered opened={sigIsModOpen.value} onClose={close} keepMounted={true} size="xs" title={sigCurDate.value ? <Title order={5}>{getDate(sigCurDate.value)}</Title> : null}>
      {sigCurDate.value ? (
        <div>
          {cur ? (
            <Stack gap="sm">
              <Text size="sm">Активное напоминание о кормлении для</Text>
              <Flex gap="sm" wrap="wrap">
                {existing?.map((c) => <SexName key={c?.id} sex={c?.sex!} name={c?.snake_name ?? ""} size="sm" />)}
              </Flex>
              <Text size="sm">{cur.repeat_interval ? `Периодичность — ${declWord(cur.repeat_interval, ["день", "дня", "дней"])}` : "Единоразово"}</Text>
              {cur.repeat_interval ? <Text size="sm">Следующее напоминание{getDate(dateAddDays(cur.scheduled_time, cur.repeat_interval))}</Text> : null}
              <Space h="md" />
              <Flex justify="space-between">
                <Button variant="default" onClick={close}>
                  Ок
                </Button>
                <Button variant="filled" color="var(--mantine-color-error)" onClick={del} loading={isPending}>
                  Удалить
                </Button>
              </Flex>
            </Stack>
          ) : (
            <>
              {isEmpty(sigSelected.value) ? (
                <>
                  <Text size="md">Нет напоминаний</Text>
                  <Space h="md" />
                  <Text size="sm">Выберите в таблице змей, для которых хотите создать напоминание о кормлении. В этот день вам придет push с перечнем питомцев.</Text>
                </>
              ) : (
                <Stack>
                  <Text size="sm">Создать напоминание для:</Text>

                  <Flex wrap="wrap" gap="sm">
                    {infoList?.map((c) => <SexName key={c?.id} sex={c?.sex!} name={c?.snake_name ?? ""} size="sm" />)}
                  </Flex>

                  <Controller
                    name="interval"
                    control={control}
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
                      createRem({
                        owner_id: userId!,
                        scheduled_time: dateToSupabaseTime(sigCurDate.value),
                        repeat_interval: getValues("interval"),
                        snake_ids: forCreate,
                      })
                    }
                  >
                    Создать
                  </Btn>
                </Stack>
              )}
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

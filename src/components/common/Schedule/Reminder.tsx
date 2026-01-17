import { FC } from "preact/compat";
import { yupResolver } from "@hookform/resolvers/yup";
import { Divider, Flex, Loader, Modal, NumberInput, Space, Stack, Text, Title } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { Controller, FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { SexName } from "@/components/common/sexName";
import { Btn } from "@/components/navs/btn/Btn";
import { ECategories, ESupabase, IRemResExt, IRemindersReq, IResSnakesList, categoryToBaseTable } from "@/api/common";
import { useSupaCreate, useSupaDel, useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { dateToSupabaseTime, getDate, getIsSame } from "@/utils/time";
import { makeSubmit } from "./const";
import { sigCurDate, sigDeletedId, sigIsModOpen } from "./signals";
import { RemContentCateg } from "./subcomponents";

interface IProp {
  snakesInRems: string[];
  remsThisDate?: IRemResExt[];
  close: () => void;
  selected: string[];
  category: ECategories;
  resetSelected: Function;
  isFetching?: boolean;
}
export const Reminder: FC<IProp> = ({ snakesInRems, close, selected, category, resetSelected, isFetching, remsThisDate }) => {
  const formInstance = useForm<any>({
    defaultValues: {},
    resolver: yupResolver({} as any),
  });

  const { forCreate } = makeSubmit(selected, snakesInRems);

  const { mutate, isPending: isDelPend } = useSupaDel(ESupabase.REM, {
    qk: [ESupabase.REM_V],
    e: false,
  });
  const { mutate: makeNew } = useSupaCreate<IRemindersReq[]>(
    ESupabase.REM,
    {
      qk: [ESupabase.REM_V],
      e: false,
    },
    true,
  );

  const closeAndRes = () => {
    sigDeletedId.value = undefined;
    close();
    formInstance.reset();
  };

  const handleCreate = (payload: IRemindersReq[]) => {
    makeNew(payload, {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "Напоминание создано" });
        closeAndRes();
        resetSelected();
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
    mutate(
      { id },
      {
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
      },
    );
  };

  return (
    <Modal centered opened={sigIsModOpen.value} onClose={closeAndRes} size="xs" title={sigCurDate.value ? <Title order={5}>{getDate(sigCurDate.value)}</Title> : null}>
      {sigCurDate.value ? (
        <div>
          {isFetching ? (
            <Flex justify="center" maw="100%" w="100%">
              <Loader size="md" />
            </Flex>
          ) : !isEmpty(remsThisDate) ? (
            <>
              <Stack gap="xs" align="start">
                <Text size="sm">{getIsSame(new Date(), sigCurDate.value) ? "Сегодня по плану кормление для" : "В эту дату кормление для"}</Text>
                <RemContentCateg remsThisDate={remsThisDate} del={del} isDelPend={isDelPend} />
              </Stack>
              {!isEmpty(selected) ? (
                <>
                  <Divider w="100%" maw="100%" mb="md" mt="sm" />
                  {isEmpty(forCreate) ? (
                    <Text size="sm">Для создания нового напоминания на эту дату, нужно выбрать хотя бы одну Змею, для которой еще не существует напоминания</Text>
                  ) : (
                    <FormProvider {...formInstance}>
                      <CreateRem handleCreate={handleCreate} creationIds={forCreate} category={category} />
                    </FormProvider>
                  )}
                </>
              ) : null}
            </>
          ) : (
            <>
              {isEmpty(selected) ? (
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
                      <CreateRem handleCreate={handleCreate} creationIds={forCreate} category={category} />
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

interface ICrRem {
  handleCreate: (arg: IRemindersReq[]) => void;
  creationIds: string[];
  category: ECategories;
}

const CreateRem: FC<ICrRem> = ({ handleCreate, creationIds, category }) => {
  const innerInstance = useFormContext<any>();
  const userId = localStorage.getItem("USER");

  const { data: list } = useSupaGet<IResSnakesList[]>({ t: categoryToBaseTable[category], s: ["snake_name", "id", "sex"].join(", "), f: (b) => b.in("id", creationIds), id: { ids: creationIds } }, !isEmpty(creationIds));

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
        onClick={() => {
          const dt = creationIds.map((a) => ({
            scheduled_time: dateToSupabaseTime(sigCurDate.value),
            repeat_interval: innerInstance.getValues("interval"),
            snake: a,
            category,
          })) as IRemindersReq[];

          handleCreate(dt);
        }}
      >
        Создать
      </Btn>
    </Stack>
  );
};

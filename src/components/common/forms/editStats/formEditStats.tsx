import { FC } from "preact/compat";
import { useEffect, useMemo } from "preact/hooks";
import { Button, Checkbox, Flex, Modal, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { nanoid } from "nanoid";
import { IFeed, IFeedReq } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { getDate, getDateObj } from "@/utils/time";
import { calcFeedEvent } from "../../SnakeCard";

const wDel = signal<string[]>([]);
const fDel = signal<string[]>([]);
const sDel = signal<string[]>([]);

interface IBase {
  table: any;
  id: string;
  opened: boolean;
  close: () => void;
}

interface IStatsProp extends IBase {
  feeding: IFeed[] | null;
  weight:
    | {
        date: string;
        weight: number;
        is_clean?: boolean;
      }[]
    | null;
}
export const EditStats: FC<IStatsProp> = ({ opened, close, weight, feeding, table, id }) => {
  const { mutate: update, isPending } = useSupaUpd<Partial<IFeedReq>>(table);

  const enhWeight = useMemo(() => (weight ?? []).sort((a, b) => getDateObj(a.date!) - getDateObj(b.date!)).map((b) => ({ ...b, id: nanoid(4) })), [weight]);
  const enhFeed = useMemo(() => (feeding ?? []).sort((a, b) => getDateObj(a.feed_last_at!) - getDateObj(b.feed_last_at!)).map((b) => ({ ...b, id: nanoid(4) })), [feeding]);

  useEffect(() => {
    if (!opened) {
      wDel.value = [];
      fDel.value = [];
    }
  }, [opened]);

  const onSub = () => {
    update(
      {
        upd: {
          ...(!isEmpty(wDel.value) ? { weight: enhWeight?.filter((a) => !wDel.value.includes(a.id)) } : {}),
          ...(!isEmpty(fDel.value) ? { feeding: enhFeed?.filter((a) => !fDel.value.includes(a.id)) } : {}),
          last_action: "update",
        } as any,
        id,
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Данные статистики изменены" });
          close();
        },
        onError: async (err) => {
          notif({
            c: "red",
            t: "Ошибка",
            m: JSON.stringify(err),
            code: err.code || err.statusCode,
          });
        },
      },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
      title={
        <>
          <Title order={5}>Корректировка данных графиков</Title>
          <Text size="xs">Отмечайте ненужные</Text>
        </>
      }
    >
      <Flex gap="xs" w="100%">
        {!isEmpty(weight) ? (
          <Checkbox.Group value={wDel.value} onChange={(c) => (wDel.value = c)} flex="1 1 50%">
            <Stack gap="xs">
              <Text fw={500}>Масса</Text>
              {enhWeight.map((a) => (
                <Checkbox key={a.id} value={a.id} size="xs" label={`${getDate(a.date)}\n${a.weight}г ${a.is_clean === false ? "- с экскрецией" : ""}`} color="var(--mantine-color-error)" style={{ whiteSpace: "pre-wrap" }} />
              ))}
            </Stack>
          </Checkbox.Group>
        ) : null}
        {!isEmpty(feeding) ? (
          <Checkbox.Group value={fDel.value} onChange={(c) => (fDel.value = c)} flex="1 1 50%">
            <Stack gap="xs">
              <Text fw={500}>Кормления</Text>
              {enhFeed.map((a) => (
                <Checkbox size="xs" value={a.id} label={calcFeedEvent(a, "xs")} key={a.id} color="var(--mantine-color-error)" />
              ))}
            </Stack>
          </Checkbox.Group>
        ) : null}
      </Flex>
      <Flex mt="md">
        <Button size="compact-xs" onClick={onSub} loading={isPending} disabled={isPending || (isEmpty(wDel.value) && isEmpty(fDel.value))} ml="auto" variant="filled" color="var(--mantine-color-error)">
          Удалить
        </Button>
      </Flex>
    </Modal>
  );
};

interface IShedProp extends IBase {
  shed: string[] | null;
}

export const EditShed: FC<IShedProp> = ({ opened, close, shed, table, id }) => {
  const { mutate: update, isPending } = useSupaUpd<Partial<IFeedReq>>(table);

  const enhShed = useMemo(() => (shed ?? []).sort((a, b) => getDateObj(a) - getDateObj(b)).map((b) => ({ date: b, id: nanoid(4) })), [shed]);

  useEffect(() => {
    if (!opened) {
      sDel.value = [];
    }
  }, [opened]);

  const onSub = () => {
    update(
      {
        upd: {
          ...(!isEmpty(sDel.value) ? { shed: enhShed?.filter((a) => !sDel.value.includes(a.id)).map((c) => c.date) } : {}),
          last_action: "update",
        } as any,
        id,
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Данные линек изменены" });
          close();
        },
        onError: async (err) => {
          notif({
            c: "red",
            t: "Ошибка",
            m: JSON.stringify(err),
            code: err.code || err.statusCode,
          });
        },
      },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
      title={
        <>
          <Title order={5}>Корректировка состоявшихся линек</Title>
          <Text size="xs">Отмечайте ненужные</Text>
        </>
      }
    >
      {!isEmpty(shed) ? (
        <Checkbox.Group value={sDel.value} onChange={(c) => (sDel.value = c)} w="100%">
          <Flex gap="sm" w="100%" wrap="wrap">
            {enhShed.map((a) => (
              <Checkbox size="xs" value={a.id} label={getDate(a.date)} key={a.id} color="var(--mantine-color-error)" />
            ))}
          </Flex>
        </Checkbox.Group>
      ) : (
        <Text fw={500} size="sm">
          Нечего корректировать
        </Text>
      )}
      <Flex mt="md">
        <Button size="compact-xs" onClick={onSub} loading={isPending} disabled={isPending || isEmpty(sDel.value)} ml="auto" variant="filled" color="var(--mantine-color-error)">
          Удалить
        </Button>
      </Flex>
    </Modal>
  );
};

import { FC } from "preact/compat";
import { useEffect, useMemo } from "preact/hooks";
import { Button, Checkbox, Flex, Modal, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { nanoid } from "nanoid";
import { IFeed } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { getDate, getDateObj } from "@/utils/time";
import { calcFeedEvent } from "../../SnakeCard";

const wDel = signal<string[]>([]);
const fDel = signal<string[]>([]);

interface IProp {
  feeding?: IFeed[];
  weight?: {
    date: string;
    weight: number;
  }[];
  table: any;
  id: string;
  opened: boolean;
  close: () => void;
}
export const EditStats: FC<IProp> = ({ opened, close, weight, feeding, table, id }) => {
  const { mutate: update } = useSupaUpd<any>(table);

  const enhWeight = useMemo(() => (weight ?? []).sort((a, b) => getDateObj(a.date!) - getDateObj(b.date!)).map((b) => ({ ...b, id: nanoid(3) })), [weight]);
  const enhFeed = useMemo(() => (feeding ?? []).sort((a, b) => getDateObj(a.feed_last_at!) - getDateObj(b.feed_last_at!)).map((b) => ({ ...b, id: nanoid(3) })), [feeding]);

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
          ...(!isEmpty(wDel) ? { weight: enhWeight?.filter((a) => !wDel.value.includes(a.id)) } : {}),
          ...(!isEmpty(fDel) ? { feeding: enhFeed?.filter((a) => !fDel.value.includes(a.id)) } : {}),
        },
        id,
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Данные статистики изменены" });
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
                <Checkbox key={a.id} value={a.id} size="xs" label={`${getDate(a.date)}\n${a.weight}г`} color="var(--mantine-color-error)" style={{ whiteSpace: "pre-wrap" }} />
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
        <Button size="compact-xs" onClick={onSub} disabled={isEmpty(wDel) && isEmpty(fDel)} ml="auto" variant="filled" color="var(--mantine-color-error)">
          Удалить
        </Button>
      </Flex>
    </Modal>
  );
};

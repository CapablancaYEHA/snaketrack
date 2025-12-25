import { FC, useEffect, useReducer, useRef, useState } from "preact/compat";
import { Box, Button, Flex, NumberInput, Stack, Table, Text, Title } from "@mantine/core";
import { ESupabase, IReqUpdViv } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { reducer } from "./const";

const dangerLimit = 3;

interface IEnt {
  entity: { [key: string]: number };
  feeder: "rat" | "mouse";
  id: string;
}
export const StockVivarium: FC<IEnt> = ({ entity, feeder, id }) => {
  const elemRef = useRef<any>(null);
  const [w, setW] = useState(0);
  const [isEdit, setEdit] = useState(false);
  const [state, dispatch] = useReducer(reducer, entity);
  const { mutate, isPending } = useSupaUpd<IReqUpdViv>(ESupabase.VIV);

  const isDirty = JSON.stringify(entity) !== JSON.stringify(state);

  const upd = () => {
    mutate(
      {
        id,
        upd: { [feeder]: state },
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Виварий актуализирован" });
          setEdit(false);
        },
        onError: (e) => {
          notif({ c: "red", t: "Что-то пошло не так", m: e.message, code: e.code });
        },
      },
    );
  };

  useEffect(() => {
    if (elemRef.current && isEdit) setW(elemRef.current.clientWidth);
  }, [elemRef, isEdit]);

  return (
    <Stack maw="100%" w="100%">
      <Title order={5} component="span" c="yellow.6">
        Запасы {feeder === "rat" ? "🐀Крыс" : "🐁Мышей"}
      </Title>
      {!isEdit ? (
        <Button size="compact-xs" onClick={() => setEdit((s) => !s)} ml="auto">
          Актуализировать
        </Button>
      ) : (
        <Flex wrap="nowrap" gap="lg" ml="auto">
          <Button
            size="compact-xs"
            onClick={() => {
              setEdit((s) => !s);
              dispatch({ type: "reset", payload: entity });
            }}
            variant="default"
            loading={isPending}
          >
            Отмена
          </Button>
          <Button size="compact-xs" onClick={upd} disabled={!isDirty} loading={isPending}>
            Сохранить
          </Button>
        </Flex>
      )}
      <Box>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Диапазон граммовки</Table.Th>
              <Table.Th>Количество</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Object.entries(entity).map(([left, right]) => {
              const [s, e] = left.split("_");
              return (
                <Table.Tr key={left}>
                  <Table.Td>
                    <Text>
                      от <strong>{s}</strong> до <strong>{e}</strong>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {isEdit ? (
                      <NumberInput
                        styles={{
                          input: { paddingLeft: w },
                        }}
                        size="xs"
                        leftSectionPointerEvents="none"
                        onChange={(f) => dispatch({ type: "change", payload: { range: left, quantity: Number(f) } })}
                        value={state[left]}
                        leftSectionWidth="auto"
                        leftSection={<Text c={right <= dangerLimit ? "var(--mantine-color-error)" : undefined} ref={elemRef}>{`\u00a0\u00a0${right} →\u00a0`}</Text>}
                        allowNegative={false}
                        allowDecimal={false}
                        allowLeadingZeros={false}
                        suffix=" шт"
                      />
                    ) : (
                      <Text c={right <= dangerLimit ? "var(--mantine-color-error)" : undefined}>{right}</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

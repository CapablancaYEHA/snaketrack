import { FC, useState } from "preact/compat";
import { ComboboxItem, Flex, Modal, Select, Space, Text, Title } from "@mantine/core";
import { debounce, isEmpty } from "lodash-es";
import { useTransferSnake } from "../../api/hooks";
import { useUserSuggestion } from "../../api/profile/hooks";
import { notif } from "../../utils/notif";
import { getDate } from "../../utils/time";
import { Btn } from "../navs/btn/Btn";

type IProp = {
  opened: boolean;
  close: () => void;
  snekId: string;
  snekName: string;
  sex?: string;
};

export const TransferSnake: FC<IProp> = ({ opened, close, snekId, snekName, sex }) => {
  const [search, setSearch] = useState("");
  const [breeder, setBreeder] = useState<ComboboxItem | null>(null);

  const { data } = useUserSuggestion(search);
  const sugg = (data ?? [])?.map((a) => ({ label: a.username, value: a.createdat }));

  const { mutate } = useTransferSnake();
  const submit = () => {
    mutate(
      { username: breeder?.label, snekId },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Ура!", m: `Змейка ${snekName} уже у нового владельца!` });
          close();
        },
        onError: (e) => {
          notif({ c: "red", t: "Ошибка", m: "Не удалось подарить змею", code: e.code });
        },
      },
    );
  };

  const handleSearch = debounce(setSearch, 300);

  return (
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={3}>Передать змею бридеру</Title>}>
      <Text>
        Новым хозяином змейки{" "}
        <Text fw={500} span>
          {snekName}
        </Text>
        <br />
        будет бридер
      </Text>
      <Select
        value={breeder ? breeder.value : null}
        onChange={(_, option) => setBreeder(option)}
        placeholder="Поиск бридера"
        clearable
        mt="md"
        searchable
        searchValue={search}
        onSearchChange={handleSearch}
        data={sugg}
        nothingFoundMessage={search.length === 0 ? "Начните печатать" : "Нет совпадений..."}
        renderOption={(it) => (
          <Flex justify="space-between" align="center" maw="100%" w="100%">
            <Text size="sm" fw={500}>
              {it.option.label}
            </Text>
            <Text size="xs">аккаунт от {getDate((it.option as any).date)}</Text>
          </Flex>
        )}
      />
      <Space h="xl" />
      <Btn onClick={submit} disabled={isEmpty(breeder)}>
        Передать
      </Btn>
    </Modal>
  );
};

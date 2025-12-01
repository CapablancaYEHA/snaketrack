import { FC, useState } from "preact/compat";
import { ComboboxItem, Flex, Loader, Modal, Select, Space, Text, Title } from "@mantine/core";
import { UseMutateFunction } from "@tanstack/react-query";
import { debounce, isEmpty } from "lodash-es";
import { ISupabaseErr, ITransferReq } from "@/api/common";
import { useUserSuggestion } from "../../../../api/profile/hooks";
import { notif } from "../../../../utils/notif";
import { getDate } from "../../../../utils/time";
import { Btn } from "../../../navs/btn/Btn";

type IProp = {
  opened: boolean;
  close: () => void;
  snekId: string;
  snekName: string;
  sex?: string;
  handleTrans: UseMutateFunction<any, ISupabaseErr, ITransferReq, unknown>;
  isPend: boolean;
};

interface ICmb extends ComboboxItem {
  id: string;
}

export const TransferSnake: FC<IProp> = ({ opened, close, snekId, snekName, handleTrans, isPend }) => {
  const [search, setSearch] = useState("");
  const [breeder, setBreeder] = useState<ICmb | null>(null);

  const { data, isFetching } = useUserSuggestion(search);
  const sugg = (data ?? [])?.map((a) => ({ label: a.username, value: a.createdat, id: a.id }));

  const subm = () => {
    handleTrans(
      { userId: breeder?.id!, snekId },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успех!", m: `Змейка ${snekName} уже у нового владельца!` });
          close();
        },
        onError: (e) => {
          notif({ c: "red", t: "Ошибка", m: e.message, code: e.code });
        },
      },
    );
  };

  const handleSearch = debounce(setSearch, 400);

  return (
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={3}>Передать змею бридеру</Title>}>
      <Text>
        Перадача осуществляется со всей статистикой, вы больше не будете иметь доступа к изменению данных.
        <br />
        Новым хозяимном змейки{" "}
        <Text fw={500} span>
          {snekName}
        </Text>
        <br />
        будет бридер
      </Text>
      <Select
        data-autofocus
        value={breeder ? breeder.value : null}
        onChange={(_, option) => setBreeder(option as any)}
        placeholder="Поиск бридера"
        clearable
        mt="md"
        searchable
        searchValue={search}
        onSearchChange={handleSearch}
        data={sugg}
        nothingFoundMessage={search.length === 0 ? "Начните печатать" : "Нет совпадений..."}
        rightSection={isFetching ? <Loader size="xs" /> : null}
        renderOption={(it) => (
          <Flex justify="space-between" align="center" maw="100%" w="100%">
            <Text size="sm" fw={500}>
              {it.option.label}
            </Text>
            <Text size="xs">аккаунт от {getDate((it.option as any).value)}</Text>
          </Flex>
        )}
      />
      <Space h="xl" />
      <Btn onClick={subm} disabled={isEmpty(breeder) || isPend} loading={isPend}>
        Передать
      </Btn>
    </Modal>
  );
};

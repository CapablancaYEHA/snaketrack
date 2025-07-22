import { FC, useState } from "preact/compat";
import { Button, ComboboxItem, Flex, Modal, Select, Space, Text, Title } from "@mantine/core";
import { debounce, isEmpty } from "lodash-es";
import { useDeleteBpSnake } from "@/api/hooks";
import { notif } from "@/utils/notif";

type IProp = {
  opened: boolean;
  close: () => void;
  snake: string;
};

export const DeleteSnake: FC<IProp> = ({ opened, close, snake }) => {
  const { mutate, isPending } = useDeleteBpSnake();

  const subm = () => {
    mutate(snake, {
      onSuccess: () => {
        notif({ c: "green", m: "Удалено" });
        close();
      },
      onError: (e) => {
        notif({ c: "red", t: "Ошибка", m: e.message, code: e.code });
      },
    });
  };

  return (
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={5}>Удаление</Title>}>
      <Title component="span" c="var(--mantine-color-error)" order={4} ta="center">
        Внимание!
      </Title>
      <Space h="xs" />
      <Text>
        Данное действие удалит все данные по Змее из вашего профиля без возможности восстановления
        <br />
        Вы уверены?
      </Text>

      <Space h="xl" />
      <Flex gap="sm" wrap="nowrap" justify="space-between">
        <Button variant="default" onClick={close}>
          Отмена
        </Button>
        <Button variant="filled" color="var(--mantine-color-error)" loading={isPending} onClick={subm}>
          Удалить
        </Button>
      </Flex>
    </Modal>
  );
};
// c="var(--mantine-color-error)"

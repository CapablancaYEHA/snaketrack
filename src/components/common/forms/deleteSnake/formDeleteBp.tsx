import { FC } from "preact/compat";
import { Box, Button, Flex, Modal, Space, Text, Title } from "@mantine/core";
import { UseMutateFunction } from "@tanstack/react-query";
import { SexName } from "@/components/common/sexName";
import { IResSnakesList, ISupabaseErr } from "@/api/common";
import { notif } from "@/utils/notif";

type IProp = {
  opened: boolean;
  close: () => void;
  target?: IResSnakesList;
  handleAction: UseMutateFunction<any, ISupabaseErr, { id: string }, unknown>;
  isPend: boolean;
};

export const DeleteBp: FC<IProp> = ({ opened, close, target, handleAction, isPend }) => {
  const subm = () => {
    handleAction(
      { id: target!.id },
      {
        onSuccess: () => {
          notif({ c: "green", m: "Удалено" });
          close();
        },
        onError: (e) => {
          notif({ c: "red", t: "Ошибка", m: e.message, code: e.code });
        },
      },
    );
  };

  return (
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={5}>Удаление</Title>} ta="center">
      <Title component="span" c="var(--mantine-color-error)" order={4}>
        Внимание!
      </Title>
      <Space h="xs" />
      <Text component="div">
        Все данные по змее
        {target ? (
          <Box pos="relative" top="3px" display="inline">
            <SexName sex={target.sex} name={target.snake_name} size="md" />
          </Box>
        ) : (
          " "
        )}
        {"  "}
        будут утеряны без возможности восстановления
        <br />
        Вы уверены?
      </Text>
      <Space h="xl" />
      <Flex gap="sm" wrap="nowrap" justify="space-between">
        <Button variant="default" onClick={close}>
          Отмена
        </Button>
        <Button variant="filled" color="var(--mantine-color-error)" loading={isPend} onClick={subm} disabled={isPend}>
          Удалить
        </Button>
      </Flex>
    </Modal>
  );
};

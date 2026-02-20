import { FC, useEffect } from "preact/compat";
import { Box, Button, Flex, Modal, Select, Space, Text, Title } from "@mantine/core";
import { UseMutateFunction } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { SexName } from "@/components/common/sexName";
import { IResSnakesList, ISupabaseErr, IUpdReq } from "@/api/common";
import { notif } from "@/utils/notif";
import { snakeStatsHardcode, snakeStatusToColor, snakeStatusToLabel } from "../../Market/utils";

type IProp = {
  opened: boolean;
  close: () => void;
  target?: IResSnakesList;
  handleAction: UseMutateFunction<any, ISupabaseErr, IUpdReq, unknown>;
  isPend: boolean;
};

export const ChangeStatus: FC<IProp> = ({ opened, close, target, handleAction, isPend }) => {
  const {
    reset,
    formState: { isDirty },
    control,
    handleSubmit,
  } = useForm<any>({
    defaultValues: { status: target?.status },
  });

  const onSub = (sb) => {
    handleAction(
      {
        id: target!.id,
        upd: {
          status: sb.status,
        },
      },
      {
        onSuccess: () => {
          notif({ c: "green", m: "Статус изменён" });
          close();
        },
        onError: (e) => {
          notif({ c: "red", t: "Ошибка", m: e.message, code: e.code });
        },
      },
    );
  };

  useEffect(() => {
    reset({ status: target?.status }, { keepDirty: true });
  }, [target?.status, reset]);

  return (
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={5}>Изменить статус</Title>}>
      <Box>
        <SexName sex={target?.sex!} name={target?.snake_name ?? ""} />
      </Box>
      <Controller
        name={"status"}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <Select allowDeselect={false} data={snakeStatsHardcode} value={value} onChange={onChange} label={"Статус"} error={error?.message} size="sm" flex="1 1 50%" />;
        }}
      />
      <Space h="sm" />
      <Text component="span" size="sm">
        После присвоения статуса{" "}
        <Text fw={500} size="md" c={snakeStatusToColor["deceased"]} component="span">
          {snakeStatusToLabel["deceased"]}
        </Text>{" "}
        или{" "}
        <Text fw={500} size="md" c={snakeStatusToColor["archived"]} component="span">
          {snakeStatusToLabel["archived"]}
        </Text>{" "}
        вы больше не сможете вносить какие-либо изменения в информацию по змее и переводить её в другие статусы
      </Text>
      <Space h="lg" />
      <Flex gap="sm" wrap="nowrap" justify="space-between">
        <Button variant="default" onClick={close}>
          Отмена
        </Button>
        <Button variant="filled" loading={isPend} onClick={handleSubmit(onSub)} disabled={!isDirty || isPend}>
          Подтвердить
        </Button>
      </Flex>
    </Modal>
  );
};

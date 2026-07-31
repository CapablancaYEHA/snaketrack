import { FC, useEffect } from "preact/compat";
import { Button, Flex, Modal, Select, Space, Text, Title } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { SexName } from "@/components/common/sexName";
import { ECategories, ESupabase, IReqCreateSnake, IResSnakesList } from "@/api/common";
import { useSupaMassUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { declWord } from "@/utils/other";
import { disStats, mrktActiveStats, snakeStatsHardcode, snakeStatusToColor, snakeStatusToLabel } from "../../Market/utils";
import { categToDeclTitle } from "../../utils";

type IProp = {
  opened: boolean;
  close: () => void;
  snakes: IResSnakesList[] | undefined;
  onSucc: Function;
  table: ESupabase;
  category: ECategories;
};

type IUpd = {
  upd: (Partial<Partial<IReqCreateSnake>> & { id?: string; pre_id?: string })[];
};

export const ChangeStatus: FC<IProp> = ({ opened, close, snakes, category, table, onSucc }) => {
  const { mutate, isPending } = useSupaMassUpd<IUpd>({
    t: table,
  });

  const title = declWord(5, categToDeclTitle[category], true, true);
  const filtered = snakes?.filter((f) => !disStats.concat(mrktActiveStats).includes(f.status));
  const isDisabled = filtered?.length === 0;

  const {
    reset,
    formState: { isDirty },
    control,
    handleSubmit,
  } = useForm<any>({
    defaultValues: { status: "collection" },
  });

  const fullClose = () => {
    reset();
    close();
  };

  const onSub = (sb) => {
    mutate(
      {
        upd: (filtered ?? []).map((b) => ({
          ...(category === ECategories.BP ? { pre_id: b.pre_id } : { id: b.id }),
          status: sb.status,
          last_action: "update",
        })) as any,
      },
      {
        onSuccess: () => {
          notif({ c: "green", m: "Статус изменён" });
          onSucc();
          fullClose();
        },
        onError: (e) => {
          notif({ c: "red", t: "Ошибка", m: e.message, code: e.code });
        },
      },
    );
  };

  useEffect(() => {
    reset({ status: "collection" }, { keepDirty: true });
  }, [reset]);

  return (
    <Modal
      opened={opened}
      onClose={fullClose}
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
      title={
        <Title order={5}>
          {title}. {filtered && filtered?.length > 1 ? "Массовая смена статуса" : "Смена статуса"}
        </Title>
      }
    >
      {isDisabled ? (
        <Text component="span" size="sm">
          Ваш массовый выбор змей содержит только статус{" "}
          <Text fw={500} size="md" c={snakeStatusToColor["archived"]} component="span">
            {snakeStatusToLabel["archived"]}
          </Text>
          , его нельзя поменять на другой. Скорректируйте выборку до змей в статусе{" "}
          <Text fw={500} size="md" c={snakeStatusToColor["collection"]} component="span">
            {snakeStatusToLabel["collection"]}
          </Text>{" "}
          , либо снимите все чекбосы и работайте с каждой змеей индивидуально.
        </Text>
      ) : (
        <Flex gap="xs" maw="100%" w="100%" wrap="wrap">
          {filtered?.map((a) => <SexName sex={a.sex!} name={a.snake_name ?? ""} key={a?.id} size={filtered?.length > 1 ? "xs" : "md"} />)}
        </Flex>
      )}
      <Space h="sm" />
      <Controller
        name={"status"}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return <Select allowDeselect={false} data={snakeStatsHardcode} value={value} onChange={onChange} label={"Статус"} error={error?.message} size="sm" flex="1 1 50%" />;
        }}
      />
      <Space h="sm" />
      <Text component="span" size="sm">
        Статусы в данном меню не влияют на объявление со змеей на Маркете. Для изменения статусов Маркета редактируйте само объявление.
        <br />
        После присвоения статуса{" "}
        <Text fw={500} size="md" c={snakeStatusToColor["archived"]} component="span">
          {snakeStatusToLabel["archived"]}
        </Text>{" "}
        вы больше не сможете вносить какие-либо изменения в информацию по змее, передавать её и менять статус.
      </Text>
      <Space h="lg" />
      <Flex gap="sm" wrap="nowrap" justify="space-between">
        <Button variant="default" onClick={close}>
          Отмена
        </Button>
        <Button variant="filled" loading={isPending} onClick={handleSubmit(onSub)} disabled={!isDirty || isPending}>
          Подтвердить
        </Button>
      </Flex>
    </Modal>
  );
};

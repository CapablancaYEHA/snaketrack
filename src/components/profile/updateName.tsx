import { FC, useEffect } from "preact/compat";
import { Button, Modal, Space, Text, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";

interface IProp {
  opened: boolean;
  close: () => void;
  sbmtCallback: (a) => void;
  title?: string;
  initName: string;
}

/* FIXME в Supabase поставил запрет на апдейт полей кроме name
теперь надо разрешить себе через dashboard ручками менять
 */
export const ModalChangeName: FC<IProp> = ({ opened, close, sbmtCallback, title = "Задать имя аккаунта", initName }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { userName: initName },
    mode: "onChange",
  });

  const onClose = () => {
    reset();
    close();
  };

  const onSub = (d) => {
    sbmtCallback(d.userName);
  };

  useEffect(() => {
    reset({ userName: initName });
  }, [reset, initName]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw="500">
          {title}
        </Text>
      }
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <form id="form_register" onSubmit={handleSubmit(onSub, undefined)}>
        <Space h="lg" />
        <TextInput
          {...register("userName", {
            required: true,
            pattern: /^[a-zA-Zа-яА-Я0-9_-\s]{3,50}$/,
            maxLength: 50,
            min: {
              value: 3,
              message: "Минимум 3 символа",
            },
          })}
          label="Отображаемое имя"
          error={errors.userName && <span>От 3 до 50 символов (разрешены - и _)</span>}
          data-autofocus
        />
        <Space h="lg" />
        <Button type="submit" size="xs">
          Подтвердить
        </Button>
      </form>
    </Modal>
  );
};

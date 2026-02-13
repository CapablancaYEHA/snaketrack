import { FC } from "preact/compat";
import { supabase } from "@/lib/client_supabase";
import { Button, Modal, PasswordInput, Space, Text } from "@mantine/core";
import { useForm } from "react-hook-form";
import { notif } from "@/utils/notif";

interface IProp {
  opened: boolean;
  close: () => void;
}

export const ModalChangePass: FC<IProp> = ({ opened, close }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onClose = () => {
    reset();
    close();
  };

  const onSub = async (d) => {
    const { error } = await supabase.auth.updateUser({
      password: d.userPass,
    });

    if (error) {
      notif({
        c: "red",
        t: "Ошибка",
        m: error?.message || "Не удалось сменить пароль",
        code: error?.code,
      });
    }

    if (!error) {
      notif({
        c: "green",
        m: "Пароль изменен",
      });
      await supabase.auth.signOut({ scope: "others" });
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw="500">
          Сменить пароль
        </Text>
      }
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <Text size="sm">Изменить или задать пароль впервые, чтобы логиниться не только через OTP</Text>
      <form id="form_change_pass" onSubmit={handleSubmit(onSub, undefined)}>
        <Space h="lg" />
        <PasswordInput
          {...register("userPass", {
            required: true,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&-])[A-Za-z\d@_$!%*?&-]{8,}$/,
          })}
          label="Пароль"
          autoComplete="new-password"
          error={errors.userPass && <p>Только английские символы (минимум 8), обязательно: 1 прописная буква + цифра + спец символ @_-$!%*?&</p>}
          required
        />
        <Space h="lg" />
        <Button type="submit" size="xs">
          Подтвердить
        </Button>
      </form>
    </Modal>
  );
};

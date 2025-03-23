import { useLocation } from "preact-iso";
import { useLayoutEffect } from "preact/hooks";
import { Anchor, Box, Button, PasswordInput, Space, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/client_supabase";
import { notif } from "../../utils/notif";
import styles from "./styles.module.scss";

export function Register() {
  const location = useLocation();
  useLayoutEffect(() => {
    let trg = document.getElementById("layoutsdbr");
    trg?.classList.add("hide");

    return () => trg?.classList.remove("hide");
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function signUpWithCheck({ email, password }): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data && data?.user?.identities && data?.user?.identities.length === 0) {
      notif({
        c: "red",
        t: "Ошибка регистрации",
        m: "Вы уже регистрировались на данный E-mail",
      });
    } else if (error) {
      notif({
        c: "red",
        t: "Ошибка регистрации",
        m: error?.message,
        code: error?.code,
      });
    } else {
      notif({
        c: "green",
        t: "Успешнао",
        m: "Подтвердите регистрацию в письме на почте",
      });
      location.route("/login");
    }
  }

  const onSubmit = async (sbmtData) => {
    signUpWithCheck({ email: sbmtData.userMail, password: sbmtData.userPass });
  };

  return (
    <Box className={styles.wrap} component="section" py="lg">
      <form id="form_register" onSubmit={handleSubmit(onSubmit, undefined)}>
        <Title order={2}>Регистрация</Title>
        <Space h="md" />
        <Text size="md">
          Уже регистрировались?{" "}
          <Anchor href="/login" underline="always">
            Залогиньтесь
          </Anchor>
        </Text>
        <Space h="lg" />
        <TextInput
          {...register("userMail", {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          })}
          label="Email"
          error={errors.userMail && <p>Формат мыла неверный</p>}
          data-autofocus
        />
        <Space h="lg" />
        <PasswordInput
          {...register("userPass", {
            required: true,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&-])[A-Za-z\d@_$!%*?&-]{8,}$/,
          })}
          label="Пароль"
          error={errors.userPass && <p>Только английские символы (минимум 8), обязательно: 1 прописная буква + цифра + спец символ @_-$!%*?&</p>}
        />
        <Space h="lg" />
        <p>
          Создавая аккаунт, вы принимаете{" "}
          <a href="/terms" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
            условия
          </a>
        </p>
        <Space h="xl" />
        <Button variant="light" type="submit" fullWidth={false} style={{ alignSelf: "center", width: "min-content" }}>
          Создать аккаунт
        </Button>
      </form>
    </Box>
  );
}

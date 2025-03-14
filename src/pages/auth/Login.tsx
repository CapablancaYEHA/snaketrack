import { useLocation } from "preact-iso";
import { useEffect, useLayoutEffect } from "preact/hooks";
import { Anchor, Box, PasswordInput, Space, Text, TextInput, Title } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { useForm } from "react-hook-form";
import { Btn } from "../../components/navs/btn/Btn";
import { supabase } from "../../lib/client_supabase";
import { notif } from "../../utils/notif";
import styles from "./styles.module.scss";

export function Login() {
  const location = useLocation();
  //   const { setAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (sbmtData) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sbmtData.userMail,
      password: sbmtData.userPass,
    });

    if (error) {
      notif({
        c: "red",
        t: "Ошибка логина",
        m: error?.message,
        code: error?.code,
      });
    }
    if (!isEmpty(data?.session)) {
      location.route("/dashboard");
    }
  };

  useLayoutEffect(() => {
    let trg = document.getElementById("layoutsdbr");
    trg?.classList.add("hide");

    return () => trg?.classList.remove("hide");
  }, []);

  return (
    <Box className={styles.wrap} py="lg">
      <form id="form_login" onSubmit={handleSubmit(onSubmit, undefined)}>
        <Title order={2}>Вход</Title>
        <Space h="md" />
        <p>
          <Text span size="md" display="inline">
            Нет аккаунта?
          </Text>
          {"  "}
          <Anchor href="/register" display="inline">
            Зарегистрироваться
          </Anchor>
        </p>
        <Space h="lg" />
        <TextInput
          {...register("userMail", {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          })}
          label="Email"
          error={errors.userMail && <p>Формат мыла неверный</p>}
          style={{ width: "100%" }}
        />
        <Space h="lg" />
        <PasswordInput
          {...register("userPass", {
            required: true,
            minLength: 8,
          })}
          label="Пароль"
          error={errors.userPass && <p>8 символов минимум - таково было требование к паролю при регистрации</p>}
        />
        <Space h="xl" />
        <Btn fullWidth={false} style={{ alignSelf: "center", width: "min-content" }} type="submit">
          Войти
        </Btn>
      </form>
    </Box>
  );
}

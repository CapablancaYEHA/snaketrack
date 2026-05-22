import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { Button, PasswordInput, Space, Stack, Text, TextInput } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { useForm } from "react-hook-form";
import { notif } from "@/utils/notif";
import { Btn } from "../navs/btn/Btn";

export const FormLoginEmailPass = () => {
  const { query, route } = useLocation();
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
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
        m: error?.message || "Неверные данные или письмо на почте не подтверждено",
        code: error?.code,
      });
    } else if (!isEmpty(data?.session)) {
      const desiredUri: string | null = localStorage.getItem("REQUESTED_URI");
      if (desiredUri) {
        route(desiredUri);
      } else {
        route("/snakes");
      }
    }
  };

  async function resetPass(email): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://snaketrack.ru/reset",
    });
    if (error) {
      notif({
        c: "red",
        t: "Что-то пошло не так",
        m: error?.message,
        code: error?.code,
      });
    } else {
      notif({
        c: "green",
        t: "Письмо выслано",
        m: "Для сброса пароля перейдите по ссылке в письме.\nОно может быть в спаме 🤣",
      });
    }
  }

  useEffect(() => {
    if (query?.email) {
      setValue("userMail", query.email);
    }
  }, [setValue, query?.email]);

  return (
    <>
      <Stack component="form" id="form_login_emailpass" onSubmit={handleSubmit(onSubmit, undefined)} gap={0}>
        <TextInput
          {...register("userMail", {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            setValueAs: (v) => v.trim(),
          })}
          label="Email"
          error={errors.userMail && <p>Формат мыла неверный</p>}
          data-autofocus
          style={{ width: "100%" }}
          required
        />
        <Space h="lg" />
        <PasswordInput
          {...register("userPass", {
            required: true,
            minLength: 8,
          })}
          label="Пароль"
          error={errors.userPass && <p>8 символов минимум - таково было требование к паролю при регистрации</p>}
          required
        />
        <Space h="xl" />
        <Btn fullWidth={false} style={{ alignSelf: "center", width: "min-content" }} type="submit">
          Войти
        </Btn>
      </Stack>
      <Space h="xl" />
      <Text size="md" onClick={() => setShow(true)} style={{ cursor: "pointer", textDecoration: "underline" }}>
        Не можете войти?
      </Text>
      {show ? (
        <>
          <Text size="sm">Заполните e-mail ↑ и сбросьте пароль, либо войдите с OTP (через меню выше)</Text>
          <Button
            variant="light"
            type="button"
            fullWidth={false}
            style={{ alignSelf: "center", width: "min-content" }}
            onClick={(e) => {
              e.preventDefault();
              resetPass(getValues("userMail"));
            }}
            size="compact-sm"
          >
            Сбросить пароль
          </Button>
        </>
      ) : null}
    </>
  );
};

import { useLocation } from "preact-iso";
import { supabase } from "@/lib/client_supabase";
import { Button, PasswordInput, Space, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { notif } from "@/utils/notif";

export const FormRegisterEmailPass = () => {
  const location = useLocation();
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

    if (error) {
      notif({
        c: "red",
        t: "Ошибка регистрации",
        m: error?.message,
        code: error?.code,
      });
    } else if (data && data?.user?.identities && data?.user?.identities.length === 0) {
      notif({
        c: "red",
        t: "Ошибка регистрации",
        m: "Вы уже регистрировались на данный E-mail",
      });
    } else {
      notif({
        c: "green",
        t: "Аккаунт создан",
        m: "Письма с подтверждением НЕ будет. Логиньтесь",
      });
      location.route(`/login?email=${email}`);
    }
  }

  const onSubmit = async (sbmtData) => {
    signUpWithCheck({ email: sbmtData.userMail, password: sbmtData.userPass });
  };

  return (
    <Stack component="form" id="form_register_emailpass" onSubmit={handleSubmit(onSubmit, undefined)} gap={0}>
      <TextInput
        {...register("userMail", {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          setValueAs: (v) => v.trim(),
        })}
        label="Email"
        error={errors.userMail && <p>Формат мыла неверный</p>}
        data-autofocus
        required
      />
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
    </Stack>
  );
};

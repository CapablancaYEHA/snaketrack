import { useLocation } from "preact-iso";
import { useEffect, useLayoutEffect } from "preact/hooks";
import { Box, Button, PasswordInput, Space, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/client_supabase";
import { notif } from "../../utils/notif";
import styles from "./styles.module.scss";

export function Reset() {
  const location = useLocation();
  const token = location.query.token;

  let trg = document.getElementById("layoutsdbr");
  useLayoutEffect(() => {
    let trgH = document.getElementById("layouthdr");
    trg?.classList.add("hide");
    trgH?.classList.add("hide");

    return () => {
      trg?.classList.remove("hide");
      trgH?.classList.remove("hide");
    };
  }, [trg]);

  useEffect(() => {
    const verifyToken = async () => {
      const { error } = await supabase.auth.verifyOtp({
        type: "recovery",
        token_hash: token,
      });

      if (error) {
        notif({
          c: "red",
          t: "Что-то пошло не так",
          m: "Проблема с токеном",
          code: error?.code,
        });
      }
    };

    if (token) verifyToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function resetPass({ newPass }): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPass,
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
        t: "Пароль успешно изменен",
        m: "Залогиньтесь с новым паролем",
      });
      location.route("/login");
    }
  }

  const onSubmit = async (sbmtData) => {
    resetPass({ newPass: sbmtData.newUserPass });
  };

  return (
    <Box className={styles.wrap} component="section" py="lg">
      <form id="form_register" onSubmit={handleSubmit(onSubmit, undefined)}>
        <Title order={2}>Смена пароля</Title>
        <Space h="md" />
        <PasswordInput
          {...register("newUserPass", {
            required: true,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&-])[A-Za-z\d@_$!%*?&-]{8,}$/,
          })}
          label="Новый пароль"
          error={errors.userPass && <p>Только английские символы (минимум 8), обязательно: 1 прописная буква + цифра + спец символ @_-$!%*?&</p>}
        />
        <Space h="lg" />

        <Button variant="light" type="submit" fullWidth={false} style={{ alignSelf: "center", width: "min-content" }}>
          Сменить пароль
        </Button>
      </form>
    </Box>
  );
}

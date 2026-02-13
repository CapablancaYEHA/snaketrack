import { useLocation } from "preact-iso";
import { useEffect, useRef, useState } from "preact/hooks";
import { supabase } from "@/lib/client_supabase";
import { Button, Flex, PinInput, Space, Stack, Text, TextInput } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { Controller, useForm, useWatch } from "react-hook-form";
import { notif } from "@/utils/notif";
import { Btn } from "../navs/btn/Btn";

export const FormLoginEmailOtp = () => {
  const { query, route } = useLocation();
  const btnRef = useRef<any>(null);
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const [wToken] = useWatch({ control, name: ["token"] });

  const onSubmit = async (sbmtData) => {
    const { data, error } = await supabase.auth.verifyOtp({ email: sbmtData.userMail, token: sbmtData.token, type: "email" });
    if (error) {
      notif({
        c: "red",
        t: "Ошибка логина",
        m: error?.message || "Неверный OTP или регистрация не пройдена",
        code: error?.code,
      });
      setErr(true);
    } else if (!isEmpty(data?.session)) {
      route("/snakes");
    }
  };

  const resend = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: getValues("userMail"),
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      notif({
        c: "red",
        m: error?.message,
        code: error?.code,
      });
    }
  };

  useEffect(() => {
    if (query?.email) {
      setValue("userMail", query.email);
    }
  }, [setValue, query?.email]);

  return (
    <>
      <Stack component="form" id="form_login_otp" onSubmit={handleSubmit(onSubmit, undefined)} gap={0}>
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
        <Controller
          name="token"
          control={control}
          render={({ field: { onChange, value } }) => {
            return <PinInput length={6} onChange={onChange} value={value} type="number" inputMode="numeric" error={err} m="0 auto" onComplete={() => btnRef.current?.focus()} />;
          }}
        />
        <Space h="xl" />
        <Btn fullWidth={false} style={{ alignSelf: "center", width: "min-content" }} type="submit" disabled={wToken?.length !== 6} ref={btnRef}>
          Войти
        </Btn>
      </Stack>
      <Space h="xl" />
      <Text size="md" onClick={() => setShow(true)} style={{ cursor: "pointer", textDecoration: "underline" }}>
        Не нашли письмо с OTP?
      </Text>
      {show ? (
        <Flex gap="sm" wrap="wrap">
          <Text size="sm" flex="1 1 65%">
            Заполните e-mail ↑ и запросите письмо снова
          </Text>
          <Button
            variant="light"
            fullWidth={false}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              resend();
            }}
            size="compact-sm"
          >
            Выслать
          </Button>
        </Flex>
      ) : null}
    </>
  );
};

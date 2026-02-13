import { useLocation } from "preact-iso";
import { supabase } from "@/lib/client_supabase";
import { Button, Space, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { notif } from "@/utils/notif";

export const FormRegisterEmailOtp = () => {
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function signOtpWithCheck({ email }): Promise<void> {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      notif({
        c: "red",
        t: "Ошибка регистрации",
        m: error?.message,
        code: error?.code,
      });
    } else if (data && (data?.user as any)?.identities && (data?.user as any)?.identities?.length === 0) {
      notif({
        c: "red",
        t: "Ошибка регистрации",
        m: "Вы уже регистрировались на данный E-mail",
      });
    } else {
      notif({
        c: "green",
        t: "Аккаунт создан",
        m: "OTP для входа выслан на почту.\nПисьмо может быть в спаме 🤣",
      });
      location.route(`/login?email=${email}`);
    }
  }

  const onSubmit = async (sbmtData) => {
    signOtpWithCheck({ email: sbmtData.userMail });
  };

  return (
    <Stack component="form" id="form_register_otp" onSubmit={handleSubmit(onSubmit, undefined)} gap={0}>
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

import { useLayoutEffect } from "preact/hooks";
import { Anchor, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { EAuth, sigRegister } from "@/components/formsAuth/const";
import { FormRegisterEmailOtp } from "@/components/formsAuth/registerEmailOtp";
import { FormRegisterEmailPass } from "@/components/formsAuth/registerEmailPass";

const handle = (a) => {
  sigRegister.value = a;
};

export function Register() {
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

  return (
    <Stack component="section" py="lg" gap="md" maw={400} w="100%" m="0 auto">
      <Title order={2}>Регистрация</Title>
      <Text size="md">
        Уже регистрировались?{" "}
        <Anchor href="/login" underline="always">
          Залогиньтесь
        </Anchor>
      </Text>
      <SegmentedControl
        size="xs"
        value={sigRegister.value}
        onChange={handle}
        w="100%"
        maw="300px"
        data={[
          {
            label: "OTP + Почта",
            value: EAuth.MAIL,
          },
          {
            label: "Почта + Пароль",
            value: EAuth.FULL,
          },
        ]}
        m="0 auto"
      />
      {sigRegister.value === EAuth.FULL ? <FormRegisterEmailPass /> : <FormRegisterEmailOtp />}
    </Stack>
  );
}

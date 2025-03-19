import { useEffect } from "preact/hooks";
import { useProfile, useUpdName } from "@/api/profile/hooks";
import { Loader, Space, Stack } from "@mantine/core";
import { signal } from "@preact/signals";
import { Btn } from "../../components/navs/btn/Btn";
import { ModalChangeName } from "../../components/profile/updateName";
import { notif } from "../../utils/notif";
import { getDateHours } from "../../utils/time";

const isOpen = signal(false);

export function Profile() {
  const userId = localStorage.getItem("USER");

  const { data, error, isError, isPending } = useProfile(userId, userId != null);

  const { mutate, isPending: isPend } = useUpdName();

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка обращения к профилю", m: error?.message });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="xs">
      <span>Имя кипера\заводчика:</span>
      <div>{data?.username ?? "Не задано"}</div>
      <Space h="xs" />
      <span>Email:</span>
      <div>{data?.usermail ?? ""}</div>
      <Space h="xs" />
      <span>Дата регистрации:</span>
      {data?.createdat != null ? <div>{getDateHours(data.createdat)}</div> : null}
      <Space h="lg" />
      {isPending ? (
        <Loader color="dark.1" size="xs" />
      ) : (
        <>
          <ModalChangeName
            opened={isOpen.value}
            close={() => (isOpen.value = false)}
            initName={data?.username ?? ""}
            sbmtCallback={(a) =>
              mutate(
                { name: a, id: userId! },
                {
                  onSuccess: () => {
                    notif({ c: "green", t: "Успешно", m: "Имя аккаунта сохранено" });
                    isOpen.value = false;
                  },
                  onError: (e) => {
                    notif({ c: "red", t: "Проблема", m: "Имя занято", code: e.code });
                  },
                },
              )
            }
          />
          <Btn fullWidth={false} style={{ width: "min-content" }} onClick={() => (isOpen.value = true)} size="xs" loading={isPend}>
            Сменить имя
          </Btn>
        </>
      )}
    </Stack>
  );
}

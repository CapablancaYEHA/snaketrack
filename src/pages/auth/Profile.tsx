import { useEffect } from "preact/hooks";
import { Anchor, Box, Flex, Loader, Space, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { ReleasesHistory } from "@/components/profile/releasesHistory";
import { useProfile, useUpdName } from "@/api/profile/hooks";
import { Btn } from "../../components/navs/btn/Btn";
import { ModalChangeName } from "../../components/profile/updateName";
import { notif } from "../../utils/notif";
import { getDateHours } from "../../utils/time";

const ver = import.meta.env.VITE_APP_VERSION;
const isOpen = signal(false);
const isShowHist = signal(false);

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
      <Flex wrap="nowrap" gap="xl">
        <div>
          <Text size="sm" c="dark.2">
            Имя кипера\заводчика:
          </Text>
          <Text size="md">{data?.username ?? "Не задано"}</Text>
        </div>
        <Box flex="1 0 156px" display="flex">
          <Btn fullWidth={false} style={{ width: "min-content", marginLeft: "auto" }} onClick={() => (isOpen.value = true)} size="xs" loading={isPend} disabled={isPend}>
            Сменить имя
          </Btn>
        </Box>
      </Flex>
      <div>
        <Text size="sm" c="dark.2">
          Email:
        </Text>
        <Text size="md">{data?.usermail ?? ""}</Text>
      </div>
      <div>
        <Text size="sm" c="dark.2">
          Дата регистрации:
        </Text>
        {data?.createdat != null ? <Text size="md">{getDateHours(data.createdat)}</Text> : null}
      </div>
      <Space h="sm" />
      <Stack w="100%" gap="xs">
        <Text c="dark.3" size="sm" component="div">
          Версия приложения v{ver}
        </Text>
        <Anchor
          href="/releases"
          c="dark.2"
          underline="always"
          inline
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            isShowHist.value = true;
          }}
        >
          история релизов
        </Anchor>
      </Stack>

      {isPending ? (
        <Loader color="dark.1" size="xs" />
      ) : (
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
      )}
      <ReleasesHistory opened={isShowHist.value} close={() => (isShowHist.value = false)} />
    </Stack>
  );
}

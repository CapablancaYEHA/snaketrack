import { useEffect } from "preact/hooks";
import { Loader, Stack, Text } from "@mantine/core";
import { FormAddBbBreed } from "@/components/forms/bpBreed/addBpBreed/formAddBbBreed";
import { useProfile } from "@/api/profile/hooks";
import { notif } from "@/utils/notif";

export function AddBreed() {
  const userId = localStorage.getItem("USER");
  const { isError, error, isPending } = useProfile(userId, userId != null);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Ошибка получения списка региусов" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      {isPending ? (
        <Loader color="dark.1" size="lg" />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Планирование невозможно
        </Text>
      ) : (
        <FormAddBbBreed />
      )}
    </Stack>
  );
}

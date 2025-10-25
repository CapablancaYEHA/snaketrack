import { useEffect } from "preact/hooks";
import { Loader, LoadingOverlay, Stack, Text } from "@mantine/core";
import { FormAddBbBreed } from "@/components/ballpythons/forms/bpBreed/addBpBreed/formAddBbBreed";
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
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      {isPending ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
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

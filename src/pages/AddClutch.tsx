import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { FormAddClutch } from "@/components/common/forms/snakeClutch/addClutch/formAddClutch";
import { useProfile } from "@/api/profile/hooks";
import { notif } from "@/utils/notif";

export function AddClutch() {
  const location = useLocation();
  const cat = location.path.split("/").slice(-1)[0];
  const userId = localStorage.getItem("USER");
  const { isError, error, isPending } = useProfile(userId, userId != null);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Ошибка получения списка змей" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      {isPending ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Ошибка запроса профиля
        </Text>
      ) : (
        <FormAddClutch category={cat as any} />
      )}
    </Stack>
  );
}

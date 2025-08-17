import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Loader, Stack, Text } from "@mantine/core";
import { FormEditBp } from "@/components/forms/editBp/formEditBp";
import { useBase64, useGenes, useSnake } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditSnake() {
  const location = useLocation();
  const { data } = useGenes();
  const { data: init, isPending, isError, error } = useSnake(location.query.id);
  const { data: base64, isPending: isPen } = useBase64(init?.picture!, init?.picture != null && !isPending);
  let def = { ...init, blob: init?.picture, picture: base64 };

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Змейка не найдена" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      {isPending && isPen ? (
        <Loader color="dark.1" size="lg" />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование невозможно
        </Text>
      ) : (
        <FormEditBp traits={data} init={def} />
      )}
    </Stack>
  );
}

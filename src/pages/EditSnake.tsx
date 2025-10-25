import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { FormEditSnake } from "@/components/common/forms/editSnake/formEditSnake";
import { categToConfig, categToTitle } from "@/components/common/utils";
import { IResSnakesList, categoryToBaseTable, categoryToBucket } from "@/api/common";
import { useBase64, useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditSnake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const t = categoryToBaseTable[p];
  const s = categoryToBucket[p];
  const title = `${categToTitle[p]}а`;
  const { data: init, isPending, isError, error } = useSupaGet<IResSnakesList>(categToConfig[p](location.query.id), Boolean(location.query.id));
  const { data: base64, isPending: isPen } = useBase64(init?.picture!, init?.picture != null && !isPending);
  let def = { ...init, blob: init?.picture, picture: base64 };

  useEffect(() => {
    if (isError || !location.query.id) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Змейка не найдена" });
    }
  }, [isError, error, location.query.id]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      {isPending && isPen ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование невозможно
        </Text>
      ) : (
        <FormEditSnake init={def} table={t} storage={s} title={title} category={p} />
      )}
    </Stack>
  );
}

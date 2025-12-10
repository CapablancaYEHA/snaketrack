import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { makeDefaultValues } from "@/components/common/forms/snakeBreed/editSnakeBreed/const";
import { FormEditSnakeBreed } from "@/components/common/forms/snakeBreed/editSnakeBreed/formEditSnakeBreed";
import { breedSingle } from "@/api/breeding/configs";
import { IResBreedingList } from "@/api/breeding/models";
import { useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditBreed() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];

  const { data, isError, error, isPending } = useSupaGet<IResBreedingList>(breedSingle(location.query.id, p as any), location.query.id != null);

  const composed = makeDefaultValues(data);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "План бридинга не найден" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      {isPending ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование бридинга невозможно
        </Text>
      ) : (
        <FormEditSnakeBreed initData={composed} category={p as any} />
      )}
    </Stack>
  );
}

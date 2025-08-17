import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { makeDefaultValues } from "@/components/forms/bpBreed/editBpBreed/const";
import { FormEditBpBreed } from "@/components/forms/bpBreed/editBpBreed/formEditBpBreed";
import { useSingleBpBreed } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditBreed() {
  const location = useLocation();
  const { data, isError, error, isPending } = useSingleBpBreed(location.query.id);

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
        <FormEditBpBreed initData={composed} />
      )}
    </Stack>
  );
}

import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { useUtilsBreed } from "@/components/common/forms/snakeBreed/common";
import { makeInitClutch } from "@/components/common/forms/snakeClutch/common";
import { FormEditClutch } from "@/components/common/forms/snakeClutch/editClutch/formEditClutch";
import { clutchSingle } from "@/api/breeding/configs";
import { IResClutch } from "@/api/breeding/models";
import { useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditClutch() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const { data, isError, error, isPending } = useSupaGet<IResClutch>(clutchSingle(location.query.id, p as any), location.query.id != null);
  const { regMales: males } = useUtilsBreed({ fetchFields: data?.males_ids.map((a) => ({ snake: a, id: a })) ?? [], category: p as any });

  const composed = makeInitClutch(data);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Кладка не найдена" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      {isPending ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование невозможно
        </Text>
      ) : (
        <FormEditClutch initData={composed} clutch={data} fathersToPick={males!} category={p as any} />
      )}
    </Stack>
  );
}

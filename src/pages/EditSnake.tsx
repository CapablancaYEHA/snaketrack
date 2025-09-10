import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Loader, Stack, Text } from "@mantine/core";
import { FormEditSnake } from "@/components/common/forms/editSnake/formEditSnake";
import { categToConfig } from "@/components/common/utils";
import { ECategories, ESupabase, IResSnakesList } from "@/api/common";
import { useBase64, useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditSnake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const t = p === ECategories.BP ? ESupabase.BP : ESupabase.BC;
  const s = p === ECategories.BP ? ESupabase.BP_PICS : ESupabase.BC_PICS;
  const title = p === ECategories.BP ? "Региуса" : "Удава";
  const { data: init, isPending, isError, error } = useSupaGet<IResSnakesList>(categToConfig[p](location.query.id), Boolean(location.query.id));
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
        <FormEditSnake init={def} table={t} storage={s} title={title} category={p} />
      )}
    </Stack>
  );
}

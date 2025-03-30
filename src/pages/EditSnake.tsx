import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Loader, Stack } from "@mantine/core";
import { FormEditBp } from "@/components/forms/editBp/formEditBp";
import { useBase64, useGenes, useSnake } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditSnake() {
  const location = useLocation();
  const { data } = useGenes();
  const { data: init, isPending, isError, error } = useSnake(location.query.id);
  const { data: d, isPending: isPen } = useBase64(init?.picture!, init?.picture != null && !isPending);
  let def = { ...init, blob: init?.picture, picture: d };

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Невозможно найти змею" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      {isPending && isPen ? <Loader color="dark.1" size="lg" /> : isError ? <span>Редактирование невозможно</span> : <FormEditBp traits={data} init={def} />}
    </Stack>
  );
}

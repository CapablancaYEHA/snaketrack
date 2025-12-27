import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { prepDiap } from "@/components/common/forms/Vivarium/const";
import { FormEditVivarium } from "@/components/common/forms/Vivarium/editVivarium";
import { ESupabase, IVivRes } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditVivarium() {
  const userId = localStorage.getItem("USER");
  const { data: viv, isPending, isError, error } = useSupaGet<IVivRes>({ t: ESupabase.VIV, f: (b) => b.eq("owner_id", userId).limit(1).single(), id: userId }, userId != null);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Виварий недоступен" });
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
        <FormEditVivarium viv={viv} initRat={prepDiap(viv.rat)} initMouse={prepDiap(viv.mouse)} />
      )}
    </Stack>
  );
}

import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { useUtilsBreed } from "@/components/forms/bpBreed/common";
import { makeDefaultClutch } from "@/components/forms/bpClutch/editClutch/const";
import { FormEditClutch } from "@/components/forms/bpClutch/editClutch/formEditClutch";
import { useSingleBpClutch } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function EditClutch() {
  const location = useLocation();
  const { data, isError, error, isPending } = useSingleBpClutch(location.query.id);
  const { regMales } = useUtilsBreed({ fetchFields: data?.males_ids.map((a) => ({ snake: a, id: a })) ?? [] });

  const composed = makeDefaultClutch(data);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Кладка не найдена" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      {isPending ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование невозможно
        </Text>
      ) : (
        <FormEditClutch initData={composed} clutch={data} fathersToPick={regMales!} />
      )}
    </Stack>
  );
}

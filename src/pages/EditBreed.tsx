import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Loader, Stack, Text } from "@mantine/core";
import { makeDefaultValues } from "@/components/forms/bpBreed/editBpBreed/const";
import { FormEditBpBreed } from "@/components/forms/bpBreed/editBpBreed/formEditBpBreed";
import { useSingleBpBreed } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";
import { notif } from "@/utils/notif";

export function EditBreed() {
  const location = useLocation();
  const userId = localStorage.getItem("USER");
  const { data: dt } = useProfile(userId, userId != null);
  const { data, isError, error, isPending } = useSingleBpBreed(location.query.id);

  const composed = makeDefaultValues(data);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "План бридинга не найден" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      {isPending ? (
        <Loader color="dark.1" size="lg" />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование бридинга невозможно
        </Text>
      ) : (
        <FormEditBpBreed initData={composed} owned_bp_list={dt?.regius_list} />
      )}
    </Stack>
  );
}

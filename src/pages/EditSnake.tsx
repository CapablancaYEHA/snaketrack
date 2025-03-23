import { useLocation } from "preact-iso";
import { Loader, Stack } from "@mantine/core";
import { FormEditBp } from "@/components/forms/editBp/formEditBp";
import { useGenes, useSnake } from "@/api/hooks";

export function EditSnake() {
  const location = useLocation();
  const { data } = useGenes();
  const { data: init, isPending } = useSnake(location.query.id);
  return (
    <Stack align="flex-start" justify="flex-start" gap="lg">
      {isPending ? <Loader color="dark.1" size="lg" /> : <FormEditBp traits={data} init={init} />}
    </Stack>
  );
}

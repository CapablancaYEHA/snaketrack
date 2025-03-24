import { useLocation } from "preact-iso";
import { Loader, Stack } from "@mantine/core";
import { FormEditBp } from "@/components/forms/editBp/formEditBp";
import { useBase64, useGenes, useSnake } from "@/api/hooks";

export function EditSnake() {
  const location = useLocation();
  const { data } = useGenes();
  const { data: init, isPending } = useSnake(location.query.id);
  const { data: d, isPending: isPen } = useBase64(init?.picture!, init?.picture != null && !isPending);
  let def = { ...init, blob: init?.picture, picture: d };

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg">
      {isPending && isPen ? <Loader color="dark.1" size="lg" /> : <FormEditBp traits={data} init={def} />}
    </Stack>
  );
}

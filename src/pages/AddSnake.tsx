import { Stack } from "@mantine/core";
import { useGenes } from "../api/hooks";
import { FormAddBp } from "../components/forms/addBp/formAddBb";

export function AddSnake() {
  const { data } = useGenes();
  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <FormAddBp traits={data!} />
    </Stack>
  );
}

import { Stack } from "@mantine/core";
import { mock } from "@/components/genetics/const";
import { useGenes } from "../api/hooks";
import { FormAddBp } from "../components/forms/addBp/formAddBb";

export function AddSnake() {
  //   const { data } = useGenes();
  return (
    <Stack align="flex-start" justify="flex-start" gap="lg">
      <FormAddBp traits={mock} />
    </Stack>
  );
}

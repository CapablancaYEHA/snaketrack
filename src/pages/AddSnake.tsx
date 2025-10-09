import { useLocation } from "preact-iso";
import { Stack } from "@mantine/core";
import { categToTitle } from "@/components/common/utils";
import { categoryToBaseTable, categoryToBucket } from "@/api/common";
import { FormAddSnake } from "../components/common/forms/addSnake/formAddSnake";

export function AddSnake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const t = categoryToBaseTable[p];
  const s = categoryToBucket[p];
  const title = `${categToTitle[p]}а`;
  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <FormAddSnake table={t} storage={s} title={title} category={p as any} />
    </Stack>
  );
}

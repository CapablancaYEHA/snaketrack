import { useLocation } from "preact-iso";
import { Stack } from "@mantine/core";
import { categToDeclTitle } from "@/components/common/utils";
import { categoryToBaseTable, categoryToBucket } from "@/api/common";
import { declWord } from "@/utils/other";
import { FormAddSnake } from "../components/common/forms/addSnake/formAddSnake";

export function AddSnake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const t = categoryToBaseTable[p];
  const s = categoryToBucket[p];
  const title = declWord(2, categToDeclTitle[p], true);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <FormAddSnake table={t} storage={s} title={title} category={p as any} />
    </Stack>
  );
}

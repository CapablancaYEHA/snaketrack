import { useLocation } from "preact-iso";
import { Stack } from "@mantine/core";
import { FormImportRR } from "@/components/common/forms/importSnake/formImportRR";
import { categToTitle } from "@/components/common/utils";
import { categoryToBaseTable } from "@/api/common";

export function ImportSnake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const t = categoryToBaseTable[p];
  const title = categToTitle[p];
  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <FormImportRR table={t} title={title} category={p as any} />
    </Stack>
  );
}

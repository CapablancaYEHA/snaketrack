import { useLocation } from "preact-iso";
import { Stack } from "@mantine/core";
import { ECategories, ESupabase } from "@/api/common";
import { FormAddSnake } from "../components/common/forms/addSnake/formAddSnake";

export function AddSnake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];
  const t = p === ECategories.BP ? ESupabase.BP : ESupabase.BC;
  const s = p === ECategories.BP ? ESupabase.BP_PICS : ESupabase.BC_PICS;
  const title = p === ECategories.BP ? "Региуса" : "Удава";
  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <FormAddSnake table={t} storage={s} title={title} category={p as any} />
    </Stack>
  );
}

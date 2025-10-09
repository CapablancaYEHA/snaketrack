import { useLocation } from "preact-iso";
import { LoadingOverlay, Text } from "@mantine/core";
import { SnakeFull } from "@/components/common/SnakeFull/SnakeFull";
import { categToConfig, categToTitle } from "@/components/common/utils";
import { IResSnakesList } from "@/api/common";
import { useSupaGet } from "@/api/hooks";

export function Snake() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];

  const title = categToTitle[p];
  const { data, isPending, isError } = useSupaGet<IResSnakesList>(categToConfig[p](location.query.id), Boolean(location.query.id));

  if (isPending) return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />;

  if (isError)
    return (
      <Text fw={500} c="var(--mantine-color-error)">
        Произошла ошибка запроса
      </Text>
    );

  return <SnakeFull title={title} category={p as any} data={data} />;
}

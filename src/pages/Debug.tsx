import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { useSupaGet } from "@/api/hooks";

export function Debug() {
  const { data, isFetching, isError } = useSupaGet<any>({ t: "corn_snakes" as any, f: (b) => b.contains("genes", '[{"label":"Amel"}]'), id: "Hypo" }, true);

  if (isFetching) return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />;

  if (isError)
    return (
      <Text fw={500} c="var(--mantine-color-error)">
        Произошла ошибка запроса
      </Text>
    );

  return (
    <div>
      <Stack>
        {data.map((a) => (
          <span key={a.id}>{a.id}</span>
        ))}
      </Stack>
    </div>
  );
}

import { LoadingOverlay, Stack, Text } from "@mantine/core";
import md5 from "crypto-js/md5";
import { IGenesComp } from "@/api/common";
import { useSupaGet } from "@/api/hooks";

const prep = (g: IGenesComp[]) => {
  return g
    ?.map((a) => {
      if (a.isPos) return `Pos ${a.label}`;
      return a.label;
    })
    .sort()
    .join(" ")
    .trim();
};

export const calculateHash = (v) => md5(prep(v)).toString();

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

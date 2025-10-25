import { useLocation } from "preact-iso";
import { LoadingOverlay, Text } from "@mantine/core";
import { MarketSnake } from "@/components/common/Market/MarketSnake";
import { ESupabase, IMarketRes } from "@/api/common";
import { useSupaGet } from "@/api/hooks";

export const MarketAdv = () => {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];

  const { data, isPending, isError } = useSupaGet<IMarketRes>({ t: ESupabase.MRKT_V, f: (b) => b.eq("id", location.query.id).limit(1).single(), id: location.query.id }, Boolean(location.query.id));

  if (isPending) return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />;

  if (isError)
    return (
      <Text fw={500} c="var(--mantine-color-error)">
        Произошла ошибка запроса
      </Text>
    );

  return <MarketSnake category={p as any} data={data} />;
};

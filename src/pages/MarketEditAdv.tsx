import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Stack, Text } from "@mantine/core";
import { FormEditSale } from "@/components/common/forms/sellSnake/formEditSale";
import { IMarketRes } from "@/api/common";
import { marketSingle } from "@/api/common_configs";
import { useBase64, useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function MarketEdit() {
  const location = useLocation();
  const p = location.path.split("/").slice(-1)[0];

  const { data: ad, isLoading, isRefetching, isError, error } = useSupaGet<IMarketRes>(marketSingle(location.query.id), Boolean(location.query.id));
  const { data: base64 } = useBase64(ad?.pictures, ad?.pictures != null && !isLoading);

  useEffect(() => {
    if (isError || !location.query.id) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Нет данных по объявлению" });
    }
  }, [isError, error, location.query.id]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Text size="md" fw={500} c="yellow.6">
        Редактирование продажи
      </Text>
      {isLoading || isRefetching ? (
        // FIXME скелетон надо
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Редактирование невозможно
        </Text>
      ) : (
        <>{ad != null ? <FormEditSale init={{ ...ad, pictures: base64 }} info={{ ...ad, date_hatch: new Date(ad.date_hatch), blob: ad.pictures }} category={p} /> : null}</>
      )}
    </Stack>
  );
}

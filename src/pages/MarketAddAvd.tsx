import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { LoadingOverlay, Select, Stack, Text } from "@mantine/core";
import { useQueryState } from "nuqs";
import { makeInit } from "@/components/common/forms/sellSnake/const";
import { FormCreateSale } from "@/components/common/forms/sellSnake/formCreateSale";
import { categToConfig, categToTitle } from "@/components/common/utils";
import { IResSnakesList } from "@/api/common";
import { marketAvailSnakes } from "@/api/common_configs";
import { useBase64, useSupaGet } from "@/api/hooks";
import { notif } from "@/utils/notif";

export function MarketAdd() {
  const location = useLocation();
  const [selected, setSelected] = useQueryState("id");
  const userId = localStorage.getItem("USER");
  const p = location.path.split("/").slice(-1)[0];

  const { data: limited } = useSupaGet<IResSnakesList[]>(marketAvailSnakes(userId, p), userId != null);
  const { data: snake, isRefetching, isLoading, isError, error } = useSupaGet<IResSnakesList>(categToConfig[p](selected), Boolean(selected));
  const { data: base64 } = useBase64(snake?.picture, snake?.picture != null && !isLoading);

  useEffect(() => {
    if (isError) {
      notif({ c: "red", t: "Ошибка", code: error?.code, m: "Змейка не найдена" });
    }
  }, [isError, error]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Text size="md" fw={500} c="yellow.6">
        Создание продажи {categToTitle[p]}a
      </Text>
      <Select data={(limited ?? []).map((l) => ({ label: l.snake_name, value: l.id }))} value={selected} onChange={setSelected as any} required label="Выберите змею" />
      {isLoading || isRefetching ? (
        // FIXME скелетон надо
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : (
        <>{snake != null ? <FormCreateSale init={makeInit({ pictures: base64 ? [base64] : null })} info={{ ...snake, snake_id: snake.id, date_hatch: new Date(snake.date_hatch), blob: snake?.picture ? [snake?.picture] : [] }} category={p} /> : null}</>
      )}
    </Stack>
  );
}

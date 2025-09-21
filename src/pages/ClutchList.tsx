import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Flex, LoadingOverlay, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { makeBpClutchColumns } from "@/components/ballpythons/forms/bpClutch/clutchUtils";
import { MiniInfo } from "@/components/ballpythons/forms/bpClutch/subcomponents";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { SkelTable } from "@/components/common/skeletons";
import { bpClutchList } from "@/api/ballpythons/configs";
import { IResBpClutch } from "@/api/ballpythons/models";
import { useSupaGet } from "@/api/hooks";

const snakeId = signal<string | undefined>(undefined);
const snakeSex = signal<string | undefined>(undefined);

const columns = makeBpClutchColumns({
  setSnake: (uuid, sex) => {
    snakeId.value = uuid;
    snakeSex.value = sex;
  },
});

export function ClutchList() {
  const userId = localStorage.getItem("USER");
  const location = useLocation();

  const { data, isPending, isRefetching, isError } = useSupaGet<IResBpClutch[]>(bpClutchList(userId), userId != null);

  const handleRowClick = (id) => {
    location.route(`/clutches/edit/ball-pythons?id=${id}`);
  };

  useEffect(() => {
    return () => {
      snakeId.value = undefined;
    };
  }, []);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Кладки Региусов
        </Title>
      </Flex>
      {isPending ? <SkelTable /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(data) ? (
        <Text fw={500}>Кладок нет</Text>
      ) : (
        <>
          <StackTable data={data ?? []} columns={columns} onRowClick={handleRowClick} />
        </>
      )}
      <MiniInfo
        opened={snakeId.value != null}
        close={() => {
          snakeId.value = undefined;
          snakeSex.value = undefined;
        }}
        snakeId={snakeId.value}
        sex={snakeSex.value}
      />
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </Stack>
  );
}

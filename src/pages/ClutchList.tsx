import { Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { makeBpClutchColumns } from "@/components/forms/bpClutch/editClutch/clutchUtils";
import { MiniInfo } from "@/components/forms/bpClutch/editClutch/subcomponents";
import { Btn } from "@/components/navs/btn/Btn";
import { useBpClutches } from "@/api/hooks";

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
  const { data, isPending, isError } = useBpClutches(userId!);

  return (
    <Stack align="flex-start" justify="flex-start" gap="xl" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Btn fullWidth={false} component="a" href="/clutches/add">
          Добавить
        </Btn>
      </Flex>
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(data) ? (
        <Text fw={500}>Кладок нет</Text>
      ) : (
        <>
          <StackTable data={data ?? []} columns={columns} />
        </>
      )}
      <MiniInfo
        opened={snakeId.value != null}
        close={() => {
          snakeId.value = undefined;
          snakeSex.value = undefined;
        }}
        selectedSnake={{ id: snakeId.value, sex: snakeSex.value }}
      />
    </Stack>
  );
}

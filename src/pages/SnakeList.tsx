import { useLocation } from "preact-iso";
import { Box, Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { BpCard } from "@/components/ballpythons/BpCard";
import { Btn } from "@/components/navs/btn/Btn";
import { TransferSnake } from "@/components/transferSnake/transfer";
import { useSnakesList } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";

const curId = signal<string | undefined>(undefined);

export function SnakeList() {
  const location = useLocation();
  const userId = localStorage.getItem("USER");
  const { data: dt, isError } = useProfile(userId, userId != null);
  const { data: d, isPending } = useSnakesList(dt?.regius_list!, !isEmpty(dt));

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Box h={60} bd="1px solid rgba(255,255,255,0.1)" flex="1 1 auto" p="md">
          филтры, поиск
        </Box>
        <Btn fullWidth={false} component="a" href="/add/ballpython">
          Добавить
        </Btn>
      </Flex>
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : dt?.regius_list == null || isEmpty(dt?.regius_list) ? (
        <Text fw={500}>Змеек у вас нет</Text>
      ) : (
        d?.map((a) => <BpCard key={a.id} body={a} onTransClick={() => (curId.value = a.id)} onEditClick={() => location.route(`/edit/ballpython?id=${a.id}`)} />)
      )}
      <TransferSnake opened={curId.value != null} close={() => (curId.value = undefined)} snekId={curId.value!} snekName={d?.find((b) => b.id === curId.value)?.snake_name ?? ""} />
    </Stack>
  );
}

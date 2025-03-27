import { useLocation } from "preact-iso";
import { Box, Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { BpCard } from "@/components/ballpythons/BpCard";
import { FeedSnake } from "@/components/feedSnake/feed";
import { Btn } from "@/components/navs/btn/Btn";
import { TransferSnake } from "@/components/transferSnake/transfer";
import { useSnakesList } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";

const curId = signal<string | undefined>(undefined);
const isTransOpen = signal<boolean>(false);
const isFeedOpen = signal<boolean>(false);

export function SnakeList() {
  const location = useLocation();
  const userId = localStorage.getItem("USER");
  const { data: dt, isError } = useProfile(userId, userId != null);
  const { data: d, isPending } = useSnakesList(dt?.regius_list!, !isEmpty(dt));

  const target = d?.find((b) => b.id === curId.value);

  return (
    <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Box h={60} bd="1px solid rgba(255,255,255,0.1)" flex="1 1 auto" p="md">
          фильтры, поиск
        </Box>
        <Btn fullWidth={false} component="a" href="/snakes/add/ballpython">
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
        d?.map((a) => (
          <BpCard
            key={a.id}
            body={a}
            handleTrans={() => {
              curId.value = a.id;
              isTransOpen.value = true;
            }}
            handleFeed={() => {
              curId.value = a.id;
              isFeedOpen.value = true;
            }}
            handleEdit={() => location.route(`/snakes/edit/ballpython?id=${a.id}`)}
          />
        ))
      )}
      <TransferSnake
        opened={isTransOpen.value}
        close={() => {
          curId.value = undefined;
          isTransOpen.value = false;
        }}
        snekId={curId.value!}
        snekName={target?.snake_name ?? ""}
      />
      <FeedSnake
        opened={isFeedOpen.value}
        close={() => {
          curId.value = undefined;
          isFeedOpen.value = false;
        }}
        snake={target}
      />
    </Stack>
  );
}

import { useLocation } from "preact-iso";
import { useMemo } from "preact/hooks";
import { Box, Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty, toString } from "lodash-es";
import { makeBpCardColumns } from "@/components/ballpythons/const";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { FeedSnake } from "@/components/forms/feedSnake/formFeedSnake";
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

  const tdata = useMemo(() => d, [toString(d)]);

  const columns = makeBpCardColumns({
    openFeed: (uuid) => {
      isFeedOpen.value = true;
      curId.value = uuid;
    },
    openTrans: (uuid) => {
      isTransOpen.value = true;
      curId.value = uuid;
    },
  });

  const target = d?.find((b) => b.id === curId.value);
  const handleRowClick = (id) => {
    location.route(`/snakes/edit/ballpython?id=${id}`);
  };

  return (
    <Stack align="flex-start" justify="flex-start" gap="xl" component="section">
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
        <StackTable data={tdata!} columns={columns} onRowClick={handleRowClick} />
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

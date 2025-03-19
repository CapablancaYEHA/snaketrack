import { Box, Flex, LoadingOverlay, Stack } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { useSnakesList } from "../api/hooks";
import { useProfile } from "../api/profile/hooks";
import { BpCard } from "../components/ballpythons/BpCard";
import { Btn } from "../components/navs/btn/Btn";

export function SnakeList() {
  const userId = localStorage.getItem("USER");
  const { data: dt } = useProfile(userId, userId != null);
  const { data: d, isPending } = useSnakesList(dt?.regius_list, !isEmpty(dt));

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
      {dt?.regius_list == null || isEmpty(dt?.regius_list) ? <div>Змеек у вас нет</div> : d?.map((a) => <BpCard key={a.id} body={a} />)}
    </Stack>
  );
}

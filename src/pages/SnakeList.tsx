import { Box, Flex, LoadingOverlay, Stack } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { useSnakesList } from "../api/hooks";
import { useProfile } from "../api/profile/hooks";
import { BpCard } from "../components/ballpythons/BpCard";
import { Btn } from "../components/navs/btn/Btn";

// FIXME del
// const hard = [
//   {
//     pre_id: 74,
//     id: "ad61ab1432",
//     snake_name: "Настоящая",
//     date_hatch: "2024-07-18T00:00:00+03:00",
//     last_supper: "2025-03-01T00:00:00+03:00",
//     sex: "male",
//     genes: [
//       {
//         id: 86,
//         gene: "inc-dom",
//         label: "Granite",
//       },
//       {
//         id: 6,
//         gene: "rec",
//         label: "Albino",
//       },
//       {
//         id: 112,
//         gene: "dom",
//         label: "Leopard",
//       },
//       {
//         id: 57,
//         gene: "rec",
//         label: "Desert Ghost",
//       },
//     ],
//     weight: 200,
//     origin: "purchase",
//     parents: null,
//     price: null,
//     feeding: "ft_mouse_runner",
//     feed_weight: null,
//     picture: "https://ezryvcyxbrgcivccpydc.supabase.co/storage/v1/object/public/snakepics/9d87ef40-d470-41a2-a25c-61e73a487dbc/f0wv0C06",
//     owner_id: "9d87ef40-d470-41a2-a25c-61e73a487dbc",
//     owner_name: "Capablanca",
//     status: null,
//   },
// ];

export function SnakeList() {
  const userId = localStorage.getItem("USER");
  const { data: dt, error } = useProfile(userId, userId != null);
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
      {/* FIXME */}
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2 }} /> : dt?.regius_list == null || isEmpty(dt?.regius_list) ? <div>Змеек у вас нет</div> : d?.map((a) => <BpCard key={a.id} body={a} />)}
      {/* {hard?.map((a) => <BpCard key={a.id} body={a} />)} */}
    </Stack>
  );
}

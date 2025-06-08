import { useLocation } from "preact-iso";
import { useMemo, useState } from "preact/hooks";
import { Box, Flex, LoadingOverlay, Select, Stack, Text, TextInput } from "@mantine/core";
import { signal } from "@preact/signals";
import { debounce, isEmpty, toString } from "lodash-es";
import { makeBpCardColumns, maturityDict } from "@/components/ballpythons/const";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { tableFiltMulti } from "@/components/common/StackTable/utils";
import { sexHardcode } from "@/components/forms/bpBreed/common";
import { FeedSnake } from "@/components/forms/feedSnake/formFeedSnake";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { TransferSnake } from "@/components/transferSnake/transfer";
import { useGenes, useSnakesList } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";

const curId = signal<string | undefined>(undefined);
const isTransOpen = signal<boolean>(false);
const isFeedOpen = signal<boolean>(false);

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

export function SnakeList() {
  const location = useLocation();
  const userId = localStorage.getItem("USER");
  const { data: genes } = useGenes();
  const { data: dt, isError } = useProfile(userId, userId != null);
  const { data: d, isPending } = useSnakesList(dt?.regius_list!, !isEmpty(dt));
  const [filt, setFilt] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const tdata = useMemo(() => d, [toString(d)]);

  const target = d?.find((b) => b.id === curId.value);
  const handleRowClick = (id) => {
    location.route(`/snakes/ballpython?id=${id}`);
  };

  const debSearch = debounce(setGlobalFilter, 400);

  return (
    <Stack align="flex-start" justify="flex-start" gap="xl" component="section">
      <Flex wrap="nowrap" maw="100%" w="100%">
        <Btn fullWidth={false} component="a" href="/snakes/add/ballpython" ml="auto">
          Добавить
        </Btn>
      </Flex>
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <TextInput flex="0 1 618px" miw={0} mr="auto" placeholder="Свободный поиск" onChange={(e: any) => setGlobalFilter(e.target.value!)} value={globalFilter} leftSection={<IconSwitch icon="search" />} />
        <Flex wrap="wrap" align="flex-start" maw="100%" w="100%" miw={0} gap="lg">
          <Select miw={0} data={sexHardcode} onChange={(a: any) => tableFiltMulti(setFilt, [a], "sex")} label="Пол" placeholder="Не выбран" />
          <MaxSelectedMulti miw={0} label="Возраст" onChange={(a) => tableFiltMulti(setFilt, a, "date_hatch")} data={maturityDict} isDataHasLabel />
          <MaxSelectedMulti miw={0} label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "genes")} data={(genes ?? [])?.map((g) => g.label)} />
        </Flex>
      </Flex>
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : dt?.regius_list == null || isEmpty(dt?.regius_list) ? (
        <Text fw={500}>Змеек у вас нет</Text>
      ) : (
        <StackTable data={tdata!} columns={columns} onRowClick={handleRowClick} columnFilters={filt} setColumnFilters={setFilt} globalFilter={globalFilter} setGlobalFilter={debSearch} />
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

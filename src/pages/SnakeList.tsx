import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { startSm } from "@/styles/theme";
import { Button, Drawer, Flex, LoadingOverlay, Select, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { debounce, isEmpty } from "lodash-es";
import { makeBpCardColumns, maturityDict } from "@/components/ballpythons/const";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { tableFiltMulti } from "@/components/common/StackTable/utils";
import { sexHardcode } from "@/components/forms/bpBreed/common";
import { DeleteSnake } from "@/components/forms/deleteSnake/formDeleteSnake";
import { FeedSnake } from "@/components/forms/feedSnake/formFeedSnake";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { TransferSnake } from "@/components/transferSnake/transfer";
import { useGenes, useSnakesList } from "@/api/hooks";

const curId = signal<string | undefined>(undefined);
const isTransOpen = signal<boolean>(false);
const isFeedOpen = signal<boolean>(false);
const isDeleteOpen = signal<boolean>(false);

const columns = makeBpCardColumns({
  openFeed: (uuid) => {
    isFeedOpen.value = true;
    curId.value = uuid;
  },
  openTrans: (uuid) => {
    isTransOpen.value = true;
    curId.value = uuid;
  },
  openDelete: (uuid) => {
    isDeleteOpen.value = true;
    curId.value = uuid;
  },
});

export function SnakeList() {
  const location = useLocation();
  const isMinSm = useMediaQuery(startSm);
  const [opened, { open, close }] = useDisclosure();
  const userId = localStorage.getItem("USER");
  const { data: genes } = useGenes();
  const { data: snakes, isPending, isError } = useSnakesList(userId!, userId != null);
  const [filt, setFilt] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const target = snakes?.find((b) => b.id === curId.value);
  const handleRowClick = (id) => {
    location.route(`/snakes/ballpython?id=${id}`);
  };

  const debSearch = debounce(setGlobalFilter, 400);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex wrap="nowrap" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Змеи
        </Title>
        <Btn fullWidth={false} component="a" href="/snakes/add/ballpython" ml="auto">
          Добавить
        </Btn>
      </Flex>
      <Drawer
        opened={opened}
        onClose={close}
        title={<Title order={5}>Фильтрация</Title>}
        position="top"
        offset={16}
        // size="auto"
        styles={{
          inner: {
            justifyContent: "center",
          },
          content: {
            height: "auto",
            width: "auto",
            maxWidth: isMinSm ? "640px" : "100%",
          },
        }}
      >
        <Flex gap="md" wrap="nowrap" align="end" flex="1 1 auto">
          <TextInput flex="1 1 50%" placeholder="Свободный поиск" onChange={(e: any) => setGlobalFilter(e.target.value!)} value={globalFilter} leftSection={<IconSwitch icon="search" />} />
          <Select flex="1 1 50%" miw={0} data={sexHardcode} onChange={(a: any) => tableFiltMulti(setFilt, [a], "sex")} label="Пол" placeholder="Не выбран" />
        </Flex>
        <Space h="md" />
        <Flex wrap="nowrap" align="flex-start" flex="1 1 auto" miw={0} gap="md">
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Возраст" onChange={(a) => tableFiltMulti(setFilt, a, "date_hatch")} data={maturityDict} isDataHasLabel />
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "genes")} data={(genes ?? [])?.map((g) => g.label)} />
        </Flex>
      </Drawer>
      <Button leftSection={<IconSwitch icon="adjust" width="16" height="16" />} variant="default" onClick={open} size="compact-xs">
        Фильтры
      </Button>
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(snakes) ? (
        <Text fw={500}>Змеек у вас нет</Text>
      ) : (
        <StackTable data={snakes ?? []} columns={columns} onRowClick={handleRowClick} columnFilters={filt} setColumnFilters={setFilt} globalFilter={globalFilter} setGlobalFilter={debSearch} />
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
      <DeleteSnake
        opened={isDeleteOpen.value}
        close={() => {
          curId.value = undefined;
          isDeleteOpen.value = false;
        }}
        target={target}
      />
    </Stack>
  );
}

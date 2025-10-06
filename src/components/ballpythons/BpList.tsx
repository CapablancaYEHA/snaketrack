import { useState } from "preact/hooks";
import { startSm } from "@/styles/theme";
import { Button, Drawer, Flex, LoadingOverlay, Select, Space, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { debounce, isEmpty } from "lodash-es";
import { sexHardcode } from "@/components/ballpythons/forms/bpBreed/common";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { DeleteBp } from "@/components/common/forms/deleteSnake/formDeleteBp";
import { FeedSnake } from "@/components/common/forms/feedSnake/formFeedSnake";
import { TransferSnake } from "@/components/common/forms/transferSnake/formTransferSnake";
import { SkelTable } from "@/components/common/skeletons";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { bpList } from "@/api/ballpythons/configs";
import { useTransferBp } from "@/api/ballpythons/misc";
import { ECategories, ESupabase, IFeedReq, IResSnakesList } from "@/api/common";
import { useSnakeGenes, useSupaDel, useSupaGet, useSupaUpd } from "@/api/hooks";
import { tableFiltMulti, tableFiltSingle } from "../common/StackTable/filters";
import { makeListColumns } from "../common/const";
import { maturityDict } from "../common/utils";

const curId = signal<string | undefined>(undefined);
const isTransOpen = signal<boolean>(false);
const isFeedOpen = signal<boolean>(false);
const isDeleteOpen = signal<boolean>(false);

const columns = makeListColumns({
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
  category: ECategories.BP,
});

export function BpList() {
  const isMinSm = useMediaQuery(startSm);
  const [opened, { open, close }] = useDisclosure();
  const userId = localStorage.getItem("USER");
  const { data: genes } = useSnakeGenes(ECategories.BP);
  const { data: snakes, isPending, isRefetching, isError } = useSupaGet<IResSnakesList[]>(bpList(userId), userId != null);
  const { mutate: feed, isPending: isFeedPend } = useSupaUpd<IFeedReq>(ESupabase.BP);
  const { mutate: del, isPending: isDelPend } = useSupaDel(ESupabase.BP);
  const { mutate: trans, isPending: isTransPend } = useTransferBp();
  const [filt, setFilt] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const target = snakes?.find((b) => b.id === curId.value);

  const debSearch = debounce(setGlobalFilter, 400);

  const isFilterNull = isEmpty(filt) && globalFilter.length === 0;

  return (
    <>
      <Flex wrap="nowrap" maw="100%" w="100%">
        <Button variant={isFilterNull ? "default" : "filled"} color={isFilterNull ? undefined : "blue"} leftSection={<IconSwitch icon="adjust" width="16" height="16" />} onClick={open} size="compact-xs">
          Фильтры {isFilterNull ? "" : "применены"}
        </Button>
        <Btn fullWidth={false} component="a" href="/snakes/add/ball-pythons" ml="auto">
          Добавить
        </Btn>
      </Flex>

      {isPending ? <SkelTable /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(snakes) ? (
        <Text fw={500}>Региусов у вас нет</Text>
      ) : (
        <>
          <Text size="xs" ta="left" w="100%">
            Закрепленная колонка отображает дополнительное меню на ховер
          </Text>
          <StackTable data={snakes ?? []} columns={columns} columnFilters={filt} setColumnFilters={setFilt} globalFilter={globalFilter} setGlobalFilter={debSearch} />
        </>
      )}
      <TransferSnake
        opened={isTransOpen.value}
        close={() => {
          curId.value = undefined;
          isTransOpen.value = false;
        }}
        snekId={curId.value!}
        snekName={target?.snake_name ?? ""}
        handleTrans={trans}
        isPend={isTransPend}
      />
      <FeedSnake
        opened={isFeedOpen.value}
        close={() => {
          curId.value = undefined;
          isFeedOpen.value = false;
        }}
        snake={target}
        title="Региус"
        handleAction={feed}
        isPend={isFeedPend}
      />
      <DeleteBp
        opened={isDeleteOpen.value}
        close={() => {
          curId.value = undefined;
          isDeleteOpen.value = false;
        }}
        target={target}
        handleAction={del}
        isPend={isDelPend}
      />
      <Drawer
        opened={opened}
        onClose={close}
        title={<Title order={5}>Фильтрация</Title>}
        position="top"
        offset={16}
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
        keepMounted
      >
        <Flex gap="md" wrap="nowrap" align="end" flex="1 1 auto">
          <TextInput flex="1 1 50%" placeholder="Свободный поиск" onChange={(e: any) => setGlobalFilter(e.target.value!)} value={globalFilter} leftSection={<IconSwitch icon="search" />} />
          <Select flex="1 1 50%" miw={0} data={sexHardcode} onChange={(a: any) => tableFiltSingle(setFilt, a, "sex")} label="Пол" placeholder="Не выбран" />
        </Flex>
        <Space h="md" />
        <Flex wrap="nowrap" align="flex-start" flex="1 1 auto" miw={0} gap="md">
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Возраст" onChange={(a) => tableFiltMulti(setFilt, a, "date_hatch")} data={maturityDict} isDataHasLabel />
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "genes")} data={(genes ?? [])?.map((g) => g.label)} />
        </Flex>
      </Drawer>
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </>
  );
}

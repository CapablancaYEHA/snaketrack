import { useState } from "preact/hooks";
import { startSm } from "@/styles/theme";
import { Box, Button, CloseButton, Drawer, Flex, LoadingOverlay, Select, Space, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { debounce, isEmpty } from "lodash-es";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { DeleteSnake } from "@/components/common/forms/deleteSnake/formDeleteSnake";
import { FeedSnake } from "@/components/common/forms/feedSnake/formFeedSnake";
import { TransferSnake } from "@/components/common/forms/transferSnake/formTransferSnake";
import { SkelTable } from "@/components/common/skeletons";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { IFeedReq, IResSnakesList, categoryToBaseTable } from "@/api/common";
import { useSnakeGenes, useSupaDel, useSupaGet, useSupaUpd, useTransferSnake } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";
import { catVisited } from "@/pages/SnakeCategories";
import { tableFiltMulti, tableFiltSingle } from "./StackTable/filters";
import { makeListColumns } from "./const";
import { sexHardcode } from "./forms/snakeBreed/common";
import { SnakeTags } from "./forms/snakeTags/formSnakeTags";
import { categToConfigList, categToTitle, maturityDict } from "./utils";

const curId = signal<string | undefined>(undefined);
const isTransOpen = signal<boolean>(false);
const isFeedOpen = signal<boolean>(false);
const isTagOpen = signal<boolean>(false);
const isDeleteOpen = signal<boolean>(false);

const base = {
  openFeed: (uuid) => {
    isFeedOpen.value = true;
    curId.value = uuid;
  },
  openTrans: (uuid) => {
    isTransOpen.value = true;
    curId.value = uuid;
  },
  openTag: (uuid) => {
    isTagOpen.value = true;
    curId.value = uuid;
  },
  openDelete: (uuid) => {
    isDeleteOpen.value = true;
    curId.value = uuid;
  },
};

export function SnakeCollectionList() {
  const isMinSm = useMediaQuery(startSm);
  const [opened, { open, close }] = useDisclosure();
  const userId = localStorage.getItem("USER");
  const { data: profile } = useProfile(userId, userId != null);
  const { data: genes } = useSnakeGenes(catVisited.value);
  const { data: snakes, isPending, isRefetching, isError } = useSupaGet<IResSnakesList[]>(categToConfigList[catVisited.value]?.(userId), userId != null);
  const { mutate: feed, isPending: isFeedPend } = useSupaUpd<IFeedReq>(categoryToBaseTable[catVisited.value]);
  const { mutate: del, isPending: isDelPend } = useSupaDel(categoryToBaseTable[catVisited.value]);
  const { mutate: trans, isPending: isTransPend } = useTransferSnake(catVisited.value);
  const [filt, setFilt] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const target = snakes?.find((b) => b.id === curId.value);

  const debSearch = debounce(setGlobalFilter, 400);

  const isFilterNull = isEmpty(filt) && globalFilter.length === 0;

  return (
    <>
      <Flex wrap="nowrap" maw="100%" w="100%" gap="sm">
        <Button variant={isFilterNull ? "default" : "filled"} color={isFilterNull ? undefined : "blue"} leftSection={<IconSwitch icon="adjust" width="16" height="16" />} onClick={open} size="compact-xs">
          Фильтры {isFilterNull ? "" : "применены"}
        </Button>
        <Button fullWidth={false} size="compact-xs" variant="default" component="a" href={`/snakes/import/${catVisited.value}`} ml="auto">
          Импортировать
        </Button>
        <Btn fullWidth={false} size="compact-xs" component="a" href={`/snakes/add/${catVisited.value}`}>
          Добавить
        </Btn>
      </Flex>

      {isPending ? <SkelTable /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(snakes) ? (
        <Text fw={500}>{categToTitle[catVisited.value]}ов у вас нет</Text>
      ) : (
        <>
          <Box style={{ alignSelf: "start" }} maw="100%" w="100%">
            <TextInput
              size="xs"
              flex="1 1 auto"
              placeholder="Поиск по примечаниям, именам"
              onChange={(e: any) => setGlobalFilter(e.target.value!)}
              value={globalFilter}
              rightSection={<CloseButton aria-label="Clear input" onClick={() => setGlobalFilter("")} style={{ display: globalFilter ? undefined : "none" }} />}
              leftSection={<IconSwitch icon="search" />}
            />
          </Box>
          <Text size="xs" ta="left" w="100%">
            Закрепленная колонка отображает дополнительное меню на ховер
          </Text>
          <StackTable
            data={snakes ?? []}
            columns={makeListColumns(base)}
            columnFilters={filt}
            setColumnFilters={setFilt}
            globalFilter={globalFilter}
            setGlobalFilter={debSearch}
            initSort={[
              {
                id: "names",
                desc: false,
              },
            ]}
          />
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
        title={categToTitle[catVisited.value]}
        handleAction={feed}
        isPend={isFeedPend}
      />
      <SnakeTags
        opened={isTagOpen.value && Boolean(curId.value)}
        close={() => {
          curId.value = undefined;
          isTagOpen.value = false;
        }}
        snake={target}
        snakeTable={categoryToBaseTable[catVisited.value]}
      />
      <DeleteSnake
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
        offset="calc(16px + env(safe-area-inset-top))"
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
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "genes")} data={(genes ?? [])?.map((g) => g.label)} />
        </Flex>
        <Space h="md" />
        <Flex wrap="nowrap" align="flex-start" flex="1 1 auto" miw={0} gap="md">
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Возраст" onChange={(a) => tableFiltMulti(setFilt, a, "date_hatch")} data={maturityDict} dataHasLabel />
          <Select flex="1 1 50%" miw={0} data={sexHardcode} onChange={(a: any) => tableFiltSingle(setFilt, a, "sex")} label="Пол" placeholder="Не выбран" />
        </Flex>
        <Flex wrap="nowrap" align="flex-start" flex="1 1 auto" miw={0} gap="md">
          <MaxSelectedMulti miw={0} flex="1 1 50%" label="Тэги" onChange={(a) => tableFiltMulti(setFilt, a, "tags")} data={profile?.snake_tags ?? []} />
        </Flex>
      </Drawer>
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </>
  );
}

import { useState } from "preact/hooks";
import { startSm } from "@/styles/theme";
import { Button, Drawer, Flex, LoadingOverlay, Space, Stack, Text, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { calcBreedTraits } from "@/components/ballpythons/const";
import { makeBpBreedColumns } from "@/components/ballpythons/forms/bpBreed/breedUtils";
import { BreedDelete } from "@/components/ballpythons/forms/bpBreed/subcomponents";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { tableFiltMulti } from "@/components/common/StackTable/filters";
import { SkelTable } from "@/components/common/skeletons";
import { calcProjGenes, calcStatusOptions } from "@/components/common/utils";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { bpBreedList } from "@/api/ballpythons/configs";
import { IResBpBreedingList } from "@/api/ballpythons/models";
import { useSupaGet } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";

const breedId = signal<string | undefined>(undefined);

const columns = makeBpBreedColumns({
  setBreedId: (uuid) => {
    breedId.value = uuid;
  },
});

interface IBreedExt extends IResBpBreedingList {
  traits: { label: string; gene: string }[];
}

export function BreedList() {
  const userId = localStorage.getItem("USER");
  const [opened, { open, close }] = useDisclosure();
  const isMinSm = useMediaQuery(startSm);
  const [filt, setFilt] = useState<any[]>([]);
  const { data: dt, isError } = useProfile(userId, userId != null);
  const { data: breed, isPending, isRefetching, isError: isBreedErr } = useSupaGet<IResBpBreedingList[]>(bpBreedList(userId), !isEmpty(dt));

  const tableData: IBreedExt[] = (breed ?? [])?.map((m) => ({ ...m, traits: calcProjGenes(m.female_genes.concat(m.male_genes.flat())) }));

  const isFilterNull = isEmpty(filt);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          Планы спариваний Региусов
        </Title>
        <Btn fullWidth={false} component="a" href="/breeding/add/ball-pythons" ml="auto">
          Добавить
        </Btn>
      </Flex>
      {isPending ? <SkelTable /> : null}
      {isError || isBreedErr ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(breed) ? (
        <Text fw={500}>Не запланировано ни одного проекта. Самое время начать!</Text>
      ) : (
        <>
          <Drawer
            opened={opened}
            onClose={close}
            title={<Title order={5}>Фильтрация</Title>}
            position="top"
            offset={16}
            size="auto"
            styles={{
              inner: {
                justifyContent: "center",
              },
              content: {
                height: "auto",
                width: "auto",
                maxWidth: 640,
              },
            }}
            keepMounted
          >
            <Flex gap="md" wrap="nowrap" flex="1 1 auto">
              <MaxSelectedMulti flex="1 1 50%" label="Самки в проектах" onChange={(a) => tableFiltMulti(setFilt, a, "female_name")} data={[...new Set(breed?.map((a) => a.female_name))]} />
              <MaxSelectedMulti flex="1 1 50%" label="Самцы в проектах" onChange={(a) => tableFiltMulti(setFilt, a, "male_names")} data={[...new Set(breed?.map((a) => a.male_names).flat())]} />
            </Flex>
            <Space h="md" />
            <Flex gap="md" wrap="nowrap" flex="1 1 auto">
              <MaxSelectedMulti flex="1 1 50%" label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "traits")} data={calcBreedTraits(breed)} />
              <MaxSelectedMulti flex="1 1 50%" label="Статус" onChange={(a: any) => tableFiltMulti(setFilt, a, "breed_status")} data={calcStatusOptions()} />
            </Flex>
          </Drawer>
          <Button color={isFilterNull ? undefined : "blue"} leftSection={<IconSwitch icon="adjust" width="16" height="16" />} variant={isFilterNull ? "default" : "filled"} onClick={open} size="compact-xs">
            Фильтры {isFilterNull ? "" : "применены"}
          </Button>
          <StackTable data={tableData} columns={columns} columnFilters={filt} setColumnFilters={setFilt} />
        </>
      )}
      <BreedDelete
        opened={breedId.value != null}
        close={() => {
          breedId.value = undefined;
        }}
        breedId={breedId.value}
      />
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </Stack>
  );
}

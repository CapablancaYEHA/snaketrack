import { useState } from "preact/hooks";
import { Flex, LoadingOverlay, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { calcBreedTraits, calcProjGenes, calcStatusOptions } from "@/components/ballpythons/const";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { tableFiltMulti } from "@/components/common/StackTable/utils";
import { makeBpBreedColumns } from "@/components/forms/bpBreed/breedUtils";
import { BreedDelete } from "@/components/forms/bpBreed/subcomponents";
import { Btn } from "@/components/navs/btn/Btn";
import { useBpBreedingList } from "@/api/hooks";
import { IResBpBreedingList } from "@/api/models";
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
  const [filt, setFilt] = useState<any[]>([]);
  const { data: dt, isError } = useProfile(userId, userId != null);
  const { data: breed, isPending, isError: isBreedErr } = useBpBreedingList(userId!, !isEmpty(dt));

  const tableData: IBreedExt[] = (breed ?? [])?.map((m) => ({ ...m, traits: calcProjGenes(m.female_genes.concat(m.male_genes.flat())) }));

  return (
    <Stack align="flex-start" justify="flex-start" gap="xl" component="section">
      <Title component="span" order={4} c="yellow.6">
        Планы спариваний
      </Title>
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Btn fullWidth={false} component="a" href="/breeding/add/ballpython" ml="auto">
          Добавить
        </Btn>
      </Flex>
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      {isError || isBreedErr ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(breed) ? (
        <Text fw={500}>Не запланировано ни одного проекта. Самое время начать!</Text>
      ) : (
        <>
          <Flex gap="sm" wrap="wrap" direction="row" maw="100%" w="100%">
            <MaxSelectedMulti flex="0 1 auto" label="Самки в проектах" onChange={(a) => tableFiltMulti(setFilt, a, "female_name")} data={[...new Set(breed?.map((a) => a.female_name))]} />
            <MaxSelectedMulti flex="0 1 auto" label="Самцы в проектах" onChange={(a) => tableFiltMulti(setFilt, a, "male_names")} data={[...new Set(breed?.map((a) => a.male_names).flat())]} />
            <MaxSelectedMulti flex="0 1 auto" label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "traits")} data={calcBreedTraits(breed)} />
            <MaxSelectedMulti flex="0 1 auto" label="Статус" onChange={(a: any) => tableFiltMulti(setFilt, a, "breed_status")} data={calcStatusOptions()} />
          </Flex>
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
    </Stack>
  );
}

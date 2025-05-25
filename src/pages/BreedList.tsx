import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { breedColumns } from "@/components/ballpythons/breedUtils";
import { calcProjGenes, calcStatusOptions, calcTraitsOptions } from "@/components/ballpythons/const";
import { MaxSelectedMulti } from "@/components/common/MaxSelectedMulti";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { tableFiltMulti } from "@/components/common/StackTable/utils";
import { Btn } from "@/components/navs/btn/Btn";
import { useBpBreedingList } from "@/api/hooks";
import { IResBpBreedingList } from "@/api/models";
import { useProfile } from "@/api/profile/hooks";

interface IBreedExt extends IResBpBreedingList {
  traits: { label: string; gene: string }[];
}

export function BreedList() {
  const location = useLocation();
  const userId = localStorage.getItem("USER");
  const [filt, setFilt] = useState<any[]>([]);
  const { data: dt, isError } = useProfile(userId, userId != null);
  const { data: breed, isPending, isError: isBreedErr } = useBpBreedingList(dt?.breeding_regius_list!, !isEmpty(dt));

  const tableData: IBreedExt[] = (breed ?? [])?.map((m) => ({ ...m, traits: calcProjGenes(m.female_genes.concat(m.male_genes.flat())) }));

  const handleRowClick = (id) => {
    location.route(`/ballpython?id=${id}`);
  };

  return (
    <Stack align="flex-start" justify="flex-start" gap="xl" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Btn fullWidth={false} component="a" href="/breeding/add/ballpython">
          Добавить
        </Btn>
      </Flex>
      {isPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
      {isError || isBreedErr ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(dt?.breeding_regius_list) || isEmpty(breed) ? (
        <Text fw={500}>Не запланировано ни одного проекта. Самое время начать!</Text>
      ) : (
        <>
          <Flex gap="sm" wrap="wrap" direction="row">
            <MaxSelectedMulti label="Самки в проектах" onChange={(a) => tableFiltMulti(setFilt, a, "female_name")} data={[...new Set(breed?.map((a) => a.female_name))]} />
            <MaxSelectedMulti label="Самцы в проектах" onChange={(a) => tableFiltMulti(setFilt, a, "male_names")} data={[...new Set(breed?.map((a) => a.male_names).flat())]} />
            <MaxSelectedMulti label="Гены" onChange={(a) => tableFiltMulti(setFilt, a, "traits")} data={calcTraitsOptions(breed)} />
            <MaxSelectedMulti label="Статус" onChange={(a: any) => tableFiltMulti(setFilt, a, "breed_status")} data={calcStatusOptions()} />
          </Flex>
          <StackTable
            data={tableData}
            columns={breedColumns}
            columnFilters={filt}
            //   onRowClick={handleRowClick}
            setColumnFilters={setFilt}
          />
        </>
      )}
    </Stack>
  );
}

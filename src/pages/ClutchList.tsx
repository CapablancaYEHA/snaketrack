import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Flex, LoadingOverlay, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { makeClutchColumns } from "@/components/common/forms/snakeClutch/clutchUtils";
import { MiniInfo } from "@/components/common/forms/snakeClutch/subcomponents";
import { SkelTable } from "@/components/common/skeletons";
import { categToTitle } from "@/components/common/utils";
import { Btn } from "@/components/navs/btn/Btn";
import { clutchList } from "@/api/breeding/configs";
import { IResClutch } from "@/api/breeding/models";
import { ECategories } from "@/api/common";
import { useSupaGet } from "@/api/hooks";

const snakeId = signal<string | undefined>(undefined);
const snakeSex = signal<string | undefined>(undefined);
const vis = localStorage.getItem("CLUTCH_VISITED") as ECategories;
const sigVisClutch = signal<ECategories>(vis ?? ECategories.BP);
const handle = (a) => {
  sigVisClutch.value = a;
  localStorage.setItem("CLUTCH_VISITED", a);
};

export function ClutchList() {
  const userId = localStorage.getItem("USER");
  const location = useLocation();

  const { data, isPending, isRefetching, isError } = useSupaGet<IResClutch[]>(clutchList(userId, sigVisClutch.value), userId != null);

  const handleRowClick = (id) => {
    location.route(`/clutches/edit/${sigVisClutch.value}?id=${id}`);
  };

  const title = `${categToTitle[sigVisClutch.value]}ов`;

  useEffect(() => {
    return () => {
      snakeId.value = undefined;
    };
  }, []);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Title component="span" order={4} c="yellow.6">
          {sigVisClutch.value === ECategories.BC ? "Беременности" : "Кладки"} {title}
        </Title>
        <Btn fullWidth={false} size="compact-xs" component="a" href={`/clutches/add/${sigVisClutch.value}`} ml="auto">
          Добавить
        </Btn>
      </Flex>
      <Flex gap="lg" wrap="wrap" align="flex-start" maw="100%" w="100%">
        <Text size="sm">Если уже имеется отложенная кладка или живородящая змея беременна, заведите запись</Text>
      </Flex>
      <SegmentedControl
        style={{ alignSelf: "center" }}
        value={sigVisClutch.value as any}
        onChange={handle}
        w="100%"
        maw="252px"
        size="xs"
        data={[
          {
            label: "Региусы",
            value: ECategories.BP,
          },
          {
            label: "Удавы",
            value: ECategories.BC,
            disabled: true,
          },
          {
            label: "Маисы",
            value: ECategories.CS,
          },
          {
            label: "Хондры",
            value: ECategories.MV,
          },
        ]}
      />
      {isPending ? <SkelTable /> : null}
      {isError ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Произошла ошибка запроса
        </Text>
      ) : isEmpty(data) ? (
        <Text fw={500}>Записей нет</Text>
      ) : (
        <>
          <StackTable
            data={data ?? []}
            columns={makeClutchColumns({
              setSnake: (uuid, sex) => {
                snakeId.value = uuid;
                snakeSex.value = sex;
              },
              category: sigVisClutch.value,
            })}
            onRowClick={handleRowClick}
          />
        </>
      )}
      <MiniInfo
        opened={snakeId.value != null}
        close={() => {
          snakeId.value = undefined;
          snakeSex.value = undefined;
        }}
        snakeId={snakeId.value}
        sex={snakeSex.value}
        category={sigVisClutch.value}
      />
      {isRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </Stack>
  );
}

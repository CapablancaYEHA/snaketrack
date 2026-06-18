import { Box, Button, Flex, Loader, LoadingOverlay, Popover, Stack, Switch, Text, Title } from "@mantine/core";
import { debounce, isEmpty } from "lodash-es";
import { FormAddVivarium } from "@/components/common/forms/Vivarium/addVivarium";
import { StockVivarium } from "@/components/common/forms/Vivarium/stockVivarium";
import { ESupabase, IVivRes } from "@/api/common";
import { useSupaGet, useSupaUpd } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";
import { IUpdProfileReq } from "@/api/profile/models";
import { notif } from "@/utils/notif";

export function Vivarium() {
  const userId = localStorage.getItem("USER");

  const { data: viv, isFetching, isError } = useSupaGet<IVivRes>({ t: ESupabase.VIV, f: (b) => b.eq("owner_id", userId).limit(1).single(), id: userId }, userId != null);
  const { data: profile, isRefetching } = useProfile(userId, userId != null);
  const { mutate, isPending: isProfPend } = useSupaUpd<IUpdProfileReq>(ESupabase.PROF);

  const deb = debounce(mutate, 400);

  const toggle = (t: boolean) =>
    deb(
      {
        id: userId!,
        upd: {
          is_vivarium_on: t,
        },
      },
      {
        onError: (e) => {
          notif({ c: "red", t: "Что-то пошло не так", m: e.message, code: e.code });
        },
      },
    );

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Flex maw="100%" w="100%" gap="md" align="center" wrap="wrap">
        <Title component="span" order={4} c="yellow.6">
          Виварий
        </Title>
        {isRefetching || isProfPend ? (
          <Flex w="130" maw="130" ml="auto" gap="sm" align="center" wrap="nowrap" justify="end">
            <Box>
              <Loader size="xs" />
            </Box>
            <Text size="sm" style={{ whiteSpace: "nowrap" }}>
              Авто-апдейт
            </Text>
          </Flex>
        ) : (
          <Switch color="teal" label="Авто-апдейт" ml="auto" onChange={(e) => toggle(e.currentTarget.checked)} checked={profile?.is_vivarium_on} disabled={isEmpty(viv) || isProfPend || isRefetching} />
        )}
      </Flex>
      {isFetching ? (
        <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} />
      ) : (
        <>
          <Popover width={360} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Button size="compact-xs" variant="default">
                Подробнее
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm">
                Позволяет задавать диапазоны граммовки КО (🐀Крысы и 🐁Мыши) и отслеживать количество запасов для них.
                <br />
                Если тоггл включен — указание типа и массы КО при кормлении становится обязательным, после каждого кормления данные автоматически корректируются.
                <br />В ином случае — контроль уменьшения запасов исключительно на вас.
              </Text>
            </Popover.Dropdown>
          </Popover>
          {!isEmpty(viv) ? (
            <Flex maw="100%" w="100%" gap="sm">
              <Text size="sm">Можно изменить диапазоны вивария</Text>
              <Button component="a" href="/vivarium/edit" size="compact-xs" variant="filled">
                Изменить
              </Button>
            </Flex>
          ) : null}

          {isEmpty(viv) || isError ? (
            <>
              <Title component="span" order={5} c="yellow.6">
                Первоначальная настройка вивария
              </Title>
              <FormAddVivarium />
            </>
          ) : null}
          {!isEmpty(viv?.rat) ? <StockVivarium entity={viv.rat} feeder="rat" id={viv.id} /> : null}

          {!isEmpty(viv?.mouse) ? <StockVivarium entity={viv.mouse} feeder="mouse" id={viv.id} /> : null}
        </>
      )}
    </Stack>
  );
}

import { useState } from "preact/hooks";
import { Indicator, LoadingOverlay, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { isEmpty } from "lodash-es";
import { Reminder } from "@/components/common/Schedule/Reminder";
import { makeScheduleColumns } from "@/components/common/Schedule/const";
import { sigCurDate, sigIsModOpen } from "@/components/common/Schedule/signals";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { SkelShedule } from "@/components/common/skeletons";
import { bpList, remList, remsByDate } from "@/api/ballpythons/configs";
import { bcList } from "@/api/boa-constrictors/configs";
import { ECategories, IRemResExt, IRemindersRes, IResSnakesList } from "@/api/common";
import { useSupaGet } from "@/api/hooks";
import { getDateObj, getDateOfMonth, getIsSame } from "@/utils/time";

export const Schedule = () => {
  const userId = localStorage.getItem("USER");
  const vis = localStorage.getItem("REMS_VISITED");
  const [rowSelection, setRowSelection] = useState<any>({});
  const [val, setVal] = useState(vis ?? ECategories.BP);

  const handle = (a) => {
    localStorage.setItem("REMS_VISITED", a);
    setVal(a);
    setRowSelection({});
  };
  const { data: bps, isPending: isBpPend, isRefetching: isBpRef, isError: isBpErr } = useSupaGet<IResSnakesList[]>(bpList(userId), val === ECategories.BP);
  const { data: bcs, isPending: isBcPend, isRefetching: isBcRef, isError: isBcErr } = useSupaGet<IResSnakesList[]>(bcList(userId), val === ECategories.BC);
  const { data: allRems, isPending: isRemPending, isRefetching: isRemRefetching, isError: isRemError } = useSupaGet<IRemindersRes[]>(remList(userId), userId != null);
  const { data: remsThisDate, isFetching } = useSupaGet<IRemResExt[]>(remsByDate(sigCurDate.value), sigCurDate.value != null);

  const eventDates = (allRems ?? [])?.map((a) => getDateObj(a.scheduled_time));
  const hasEvent = (date: Date) => {
    return eventDates.some((eventDate) => getIsSame(eventDate, date));
  };

  const dataToUse = val === ECategories.BP ? (bps ?? []) : (bcs ?? []);

  const isSmthPending = (isBpPend && val === ECategories.BP) || (isBcPend && val === ECategories.BC) || isRemPending;

  return (
    <>
      <Stack align="flex-start" justify="flex-start" gap="md" component="section">
        <Title component="span" order={4} c="yellow.6">
          Напоминания о кормлениях
        </Title>
        {isSmthPending ? <SkelShedule /> : null}
        {isBpErr || isBcErr || isRemError ? (
          <Text fw={500} c="var(--mantine-color-error)">
            Произошла ошибка запроса
          </Text>
        ) : isEmpty(bps) && isEmpty(bcs) ? (
          <Text fw={500}>Нет змеек, для которых можно было бы составить расписание</Text>
        ) : (
          <>
            <Calendar
              opacity={isSmthPending ? 0 : 1}
              style={{ alignSelf: "center" }}
              locale="ru"
              getDayProps={(date) => ({
                onClick: () => {
                  sigIsModOpen.value = true;
                  sigCurDate.value = date;
                },
              })}
              minDate={new Date()}
              renderDay={(date) => {
                const day = getDateOfMonth(date);

                return hasEvent(date) ? (
                  <Indicator size={6} color={getIsSame(new Date(), date) ? "orange" : "green"} offset={-2} processing zIndex={3}>
                    <div>{day}</div>
                  </Indicator>
                ) : null;
              }}
            />
            <SegmentedControl
              style={{ alignSelf: "center" }}
              opacity={isSmthPending ? 0 : 1}
              value={val}
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
                },
              ]}
            />
            {val ? <StackTable data={dataToUse} columns={makeScheduleColumns()} onRowSelect={setRowSelection} rowSelection={rowSelection} /> : null}
          </>
        )}
      </Stack>
      <Reminder
        isFetching={isFetching}
        snakesInRems={(allRems ?? []).map((c) => c.snake)}
        close={() => {
          sigIsModOpen.value = false;
          sigCurDate.value = undefined;
        }}
        selected={Object.keys(rowSelection)}
        category={vis as ECategories}
        resetSelected={() => setRowSelection({})}
        remsThisDate={remsThisDate ?? []}
      />
      {isBpRef || isBcRef || isRemRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </>
  );
};

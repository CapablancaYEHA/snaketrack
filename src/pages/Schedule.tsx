import { useState } from "preact/hooks";
import { Indicator, LoadingOverlay, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { signal } from "@preact/signals";
import { isEmpty } from "lodash-es";
import { Reminder } from "@/components/common/Schedule/Reminder";
import { makeScheduleColumns } from "@/components/common/Schedule/const";
import { sigCurCat, sigCurDate, sigIsModOpen } from "@/components/common/Schedule/signals";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { FeedSnake } from "@/components/common/forms/feedSnake/formFeedSnake";
import { SkelShedule } from "@/components/common/skeletons";
import { bpList, remList, remsByDate } from "@/api/ballpythons/configs";
import { bcList } from "@/api/boa-constrictors/configs";
import { ECategories, ESupabase, IFeedReq, IRemResExt, IRemindersRes, IResSnakesList } from "@/api/common";
import { useSupaGet, useSupaUpd } from "@/api/hooks";
import { getDateObj, getDateOfMonth, getIsSame } from "@/utils/time";

const isFeedOpen = signal<boolean>(false);
const curId = signal<string | undefined>(undefined);

const columns = makeScheduleColumns({
  openFeed: (b) => {
    isFeedOpen.value = true;
    curId.value = b;
  },
});

export const Schedule = () => {
  const userId = localStorage.getItem("USER");
  const [rowSelection, setRowSelection] = useState<any>({});

  const handle = (a) => {
    sigCurCat.value = a;
    localStorage.setItem("REMS_VISITED", a);
    setRowSelection({});
  };
  const { data: bps, isPending: isBpPend, isRefetching: isBpRef, isError: isBpErr } = useSupaGet<IResSnakesList[]>(bpList(userId), sigCurCat.value === ECategories.BP);
  const { data: bcs, isPending: isBcPend, isRefetching: isBcRef, isError: isBcErr } = useSupaGet<IResSnakesList[]>(bcList(userId), sigCurCat.value === ECategories.BC);
  const { data: allRems, isPending: isRemPending, isRefetching: isRemRefetching, isError: isRemError } = useSupaGet<IRemindersRes[]>(remList(userId), userId != null);
  const { data: remsThisDate, isFetching } = useSupaGet<IRemResExt[]>(remsByDate(sigCurDate.value), sigCurDate.value != null);
  const { mutate: feed, isPending: isFeedPend } = useSupaUpd<IFeedReq>(sigCurCat.value === ECategories.BP ? ESupabase.BP : ESupabase.BC);

  const eventDates = (allRems ?? [])?.map((a) => getDateObj(a.scheduled_time));
  const hasEvent = (date: Date) => {
    return eventDates.some((eventDate) => getIsSame(eventDate, date));
  };

  const dataToUse = sigCurCat.value === ECategories.BP ? (bps ?? []) : (bcs ?? []);

  const isSmthPending = (isBpPend && sigCurCat.value === ECategories.BP) || (isBcPend && sigCurCat.value === ECategories.BC) || isRemPending;

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
              value={sigCurCat.value as any}
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
            <Text size="xs">Закрепленная колонка отображает дополнительное меню на ховер</Text>
            {sigCurCat.value ? <StackTable data={dataToUse} columns={columns} onRowSelect={setRowSelection} rowSelection={rowSelection} /> : null}
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
        category={sigCurCat.value}
        resetSelected={() => setRowSelection({})}
        remsThisDate={remsThisDate ?? []}
      />
      <FeedSnake
        opened={isFeedOpen.value}
        close={() => {
          curId.value = undefined;
          isFeedOpen.value = false;
        }}
        snake={dataToUse?.find((b) => b.id === curId.value)}
        title={sigCurCat.value === ECategories.BP ? "Региус" : "Удав"}
        handleAction={feed}
        isPend={isFeedPend}
      />

      {isBpRef || isBcRef || isRemRefetching ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
    </>
  );
};

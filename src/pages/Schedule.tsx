import { Indicator, LoadingOverlay, Stack, Text, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { isEmpty } from "lodash-es";
import { Reminder } from "@/components/common/Schedule/Reminder";
import { makeScheduleColumns } from "@/components/common/Schedule/const";
import { sigCurDate, sigIsModOpen, sigSelected } from "@/components/common/Schedule/signals";
import { StackTable } from "@/components/common/StackTable/StackTable";
import { useReminders, useSnakesList } from "@/api/hooks";
import { getDateObj, getDateOfMonth, getIsSame } from "@/utils/time";

export const Schedule = () => {
  const userId = localStorage.getItem("USER");

  const { data: snakes, isPending, isError } = useSnakesList(userId!, userId != null);
  const { data: rem, isPending: isRemPending, isError: isRemError } = useReminders(userId!, userId != null);
  const eventDates = (rem ?? [])?.map((a) => getDateObj(a.scheduled_time));

  const hasEvent = (date: Date) => {
    return eventDates.some((eventDate) => getIsSame(eventDate, date));
  };

  return (
    <>
      <Stack align="flex-start" justify="flex-start" gap="lg" component="section">
        <Title component="span" order={4} c="yellow.6">
          Напоминания о кормлениях
        </Title>
        {isPending || isRemPending ? <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0.5 }} /> : null}
        {isError || isRemError ? (
          <Text fw={500} c="var(--mantine-color-error)">
            Произошла ошибка запроса
          </Text>
        ) : isEmpty(snakes) ? (
          <Text fw={500}>Нет змеек, для которых можно было бы составить расписание</Text>
        ) : (
          <>
            <Calendar
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

                return (
                  <Indicator size={6} color={getIsSame(new Date(), date) ? "orange" : "green"} offset={-2} disabled={!hasEvent(date)} processing>
                    <div>{day}</div>
                  </Indicator>
                );
              }}
            />
            <StackTable data={snakes ?? []} columns={makeScheduleColumns()} onSelect={(arg) => (sigSelected.value = Object.keys(arg))} />
          </>
        )}
      </Stack>
      <Reminder
        reminders={rem ?? []}
        allSnakes={snakes ?? []}
        close={() => {
          sigIsModOpen.value = false;
          sigCurDate.value = undefined;
        }}
      />
    </>
  );
};

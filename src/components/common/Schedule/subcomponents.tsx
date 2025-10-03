import { FC, useState } from "preact/compat";
import { Box, Button, Flex, Space, Stack, Text } from "@mantine/core";
import { SexName } from "@/components/common/sexName";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { IRemResExt } from "@/api/common";
import { declWord } from "@/utils/other";
import { dateAddDays, getDateCustom } from "@/utils/time";

interface IProp {
  rem?: IRemResExt;
  handleDel: (id: string) => void;
  isPend?: boolean;
}

export const SnakeRem: FC<IProp> = ({ rem, handleDel, isPend }) => {
  const [isOpen, setOpen] = useState(false);

  if (!rem) {
    return null;
  }

  return (
    <Flex gap="xs" w="100%" align="start">
      <Stack gap="xs" align="start">
        <Flex wrap="wrap" gap="xs">
          <SexName sex={rem?.sex!} name={rem?.snake_name ?? ""} size="sm" />
        </Flex>
        <Text size="xs">
          {rem.repeat_interval ? `Периодичность — ${declWord(rem.repeat_interval, ["день", "дня", "дней"])}` : "Единоразово"}
          {rem.repeat_interval ? (
            <>
              <br />
              Следующее напоминание {getDateCustom(dateAddDays(rem.scheduled_time, rem.repeat_interval), "D MMMM")}
            </>
          ) : null}
        </Text>
      </Stack>
      <Stack ml="auto" gap="xs" align="end">
        <Box onClick={() => setOpen(true)} style={{ cursor: "pointer" }} pl="xs" pr="xs" pb="xs">
          <IconSwitch icon="bin" width="18" height="18" />
        </Box>
        {isOpen ? (
          <Box>
            <Text component="div" size="xs">
              Удалить напоминание?
            </Text>
            <Space h="sm" />
            <Flex gap="sm" wrap="nowrap" justify="space-between">
              <Button variant="default" onClick={() => setOpen(false)} size="compact-xs">
                Отмена
              </Button>
              <Button variant="filled" color="var(--mantine-color-error)" loading={isPend} disabled={isPend} onClick={() => handleDel(rem.id)} size="compact-xs">
                Удалить
              </Button>
            </Flex>
          </Box>
        ) : null}
      </Stack>
    </Flex>
  );
};

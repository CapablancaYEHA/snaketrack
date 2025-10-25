import { FC, useState } from "preact/compat";
import { Fragment } from "preact/jsx-runtime";
import { Box, Button, Divider, Flex, Space, Stack, Text } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { SexName } from "@/components/common/sexName";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ECategories, IRemResExt } from "@/api/common";
import { declWord } from "@/utils/other";
import { dateAddDays, getDateCustom } from "@/utils/time";
import { listReminderContents } from "./const";
import { sigDeletedId } from "./signals";

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
          <IconSwitch icon="bin" width="18" height="18" style={{ opacity: 0.4 }} />
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

const labels = ["Региусы", "Удавы", "Маисы"];
interface IRemContentProp {
  remsThisDate?: IRemResExt[];
  del: (id: string) => void;
  isDelPend: boolean;
}
export const RemContentCateg: FC<IRemContentProp> = ({ remsThisDate, del, isDelPend }) => {
  const result = listReminderContents(Object.values(ECategories), remsThisDate);

  return result.map((r, index, arr) => {
    return !isEmpty(r) ? (
      <Fragment key={`${labels[index]}_${index}`}>
        <Divider w="100%" maw="100%" label={labels[index]} labelPosition="center" mt={index > 0 && !isEmpty(arr[index - 1]) ? "xs" : undefined} />
        {r?.map((a, ind, self) => (
          <Fragment key={a.id}>
            <SnakeRem rem={a} handleDel={del} key={a.id} isPend={isDelPend && a.id === sigDeletedId.value} />
            {ind !== self.length - 1 ? <Divider w="100%" maw="100%" opacity={0.5} variant="dashed" /> : null}
          </Fragment>
        ))}
      </Fragment>
    ) : null;
  });
};

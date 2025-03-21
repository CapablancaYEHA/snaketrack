import { FC } from "preact/compat";
import fallback from "@assets/placeholder.png";
import { Button, Flex, Image, Menu, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { getAge, getDate } from "../../utils/time";
import { GenePill } from "../genetics/geneSelect";
import { IconSwitch } from "../navs/sidebar/icons/switch";
import { TransferSnake } from "../transferSnake/transfer";

const curId = signal(undefined);

export const BpCard: FC<any> = ({ body }) => {
  return (
    <Flex columnGap="md" w="100%" maw="100%" justify="space-between" wrap="wrap">
      <Stack gap="xs">
        <Image src={body.picture} fit="cover" radius="md" w={196} h={110} fallbackSrc={fallback} loading="eager" />
        <Flex gap="xs" align="center">
          <IconSwitch icon={body.sex} width="24" height="24" />
          <Text size="lg">{body.snake_name}</Text>
        </Flex>
        <Text size="md">⌛ {getAge(body.date_hatch)}</Text>
      </Stack>
      <Stack gap="xs">
        {body.genes.map((a) => (
          <GenePill key={a.label} item={a} />
        ))}
      </Stack>
      <Stack gap="xs">
        <Text size="sm">Текущий вес: {body.weight ? `${body.weight}г` : "Нет данных"}</Text>
        <Text size="sm">Последнее кормление: {body.feeding ? `${getDate(body.last_supper)}` : "Нет данных"}</Text>
      </Stack>
      <div>
        <Menu
          shadow="md"
          width={164}
          transitionProps={{ transition: "rotate-left", duration: 150 }}
          trigger="click"
          loop={false}
          withinPortal={false}
          trapFocus={false}
          menuItemTabIndex={0}
          position="bottom-end"
          offset={6}
          withArrow
          arrowPosition="center"
          closeOnClickOutside
        >
          <Menu.Target>
            <Button
              styles={{
                section: { margin: 0 },
              }}
              leftSection={<IconSwitch icon="kebab" />}
              variant="default"
              size="compact-xs"
              w={22}
            />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>Редактировать</Menu.Item>
            <Menu.Item onClick={() => (curId.value = body.id)}>Передать</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      <TransferSnake opened={curId.value === body.id} close={() => (curId.value = undefined)} snekId={body.id} snekName={body.snake_name} />
    </Flex>
  );
};

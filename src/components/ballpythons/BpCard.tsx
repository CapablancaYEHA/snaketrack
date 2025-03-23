import { FC } from "preact/compat";
import fallback from "@assets/placeholder.png";
import { Button, Flex, Image, Menu, Stack, Text } from "@mantine/core";
import { getAge, getDate } from "../../utils/time";
import { GenePill } from "../genetics/geneSelect";
import { IconSwitch } from "../navs/sidebar/icons/switch";

// FIXME typing
export const BpCard: FC<any> = ({ body, onTransClick, onEditClick }) => {
  return (
    <Flex columnGap="md" w="100%" maw="100%" justify="space-between" wrap="wrap">
      <Stack gap="xs" flex="0 1 196px">
        <Image src={body.picture} fit="cover" radius="md" mih={110} w="auto" maw="100%" h="100%" fallbackSrc={fallback} loading="lazy" />
        <Flex gap="xs" align="center">
          <IconSwitch icon={body.sex} width="24" height="24" />
          <Text size="lg">{body.snake_name}</Text>
        </Flex>
        <Text size="md">⌛ {getAge(body.date_hatch)}</Text>
      </Stack>
      <Stack gap="xs" flex="0 1 90px">
        {body.genes.map((a) => (
          <GenePill key={a.label} item={a} />
        ))}
      </Stack>
      <Stack gap="xs">
        <Text size="sm">Текущий вес: {body.weight ? `${body.weight}г` : "Нет данных"}</Text>
        <Text size="sm">Последнее кормление: {body.feeding[0]?.feed_last_at ? `${getDate(body.feeding[0]?.feed_last_at)}` : "Нет данных"}</Text>
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
            <Menu.Item onClick={onEditClick}>Редактировать</Menu.Item>
            <Menu.Item onClick={onTransClick}>Передать</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </Flex>
  );
};

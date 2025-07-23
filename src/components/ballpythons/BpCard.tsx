import { ActionIcon, Flex, Menu, Stack, Text } from "@mantine/core";
import { IFeed } from "@/api/models";
import { getDate } from "../../utils/time";
import { sortBpGenes } from "../genetics/const";
import { GenePill } from "../genetics/geneSelect";
import { IconSwitch } from "../navs/sidebar/icons/switch";

const calcFeedEvent = (feed?: IFeed) => {
  if (feed?.refuse) {
    return (
      <Text fw={500} component="span" c="#00FFC0">
        Отказ
      </Text>
    );
  }
  if (feed?.regurgitation) {
    return (
      <Text fw={500} component="span" c="var(--mantine-color-error)">
        Срыг
      </Text>
    );
  }
  if (feed?.feed_last_at != null) {
    return getDate(feed.feed_last_at);
  }
  return "Нет данных";
};

export const BpGenes = ({ genes }) => (
  <Flex wrap="wrap" gap="xs">
    {sortBpGenes(genes).map((a) => (
      <GenePill key={`${a.label}_${a.id}`} item={a} />
    ))}
  </Flex>
);

export const BpEventsBlock = ({ feeding, weight, shed }) => {
  const lastWeight = weight?.[weight?.length - 1];
  const lastFeed = feeding?.[feeding.length - 1];
  const lastShed = shed?.[shed.length - 1];

  return (
    <Stack gap="xs">
      <Text size="sm">Текущий вес: {lastWeight?.weight != null ? `${lastWeight.weight}г` : "Нет данных"}</Text>
      <Text size="sm">Последнее кормление: {calcFeedEvent(lastFeed)}</Text>
      <Text size="sm">Последняя линька: {lastShed != null ? `${getDate(lastShed)}` : "Нет данных"}</Text>
    </Stack>
  );
};

export const BpControls = ({ id, openFeed, openTrans, openDelete }) => {
  return (
    <Menu
      shadow="md"
      width={164}
      transitionProps={{ transition: "rotate-left", duration: 150 }}
      trigger="click"
      loop={false}
      withinPortal
      trapFocus={false}
      menuItemTabIndex={0}
      position="bottom-end"
      offset={6}
      withArrow
      arrowPosition="center"
      closeOnClickOutside
      keepMounted={false}
    >
      <Menu.Target>
        <ActionIcon size="sm" variant="transparent" color="gray" aria-label="Table Action Kebab" onClick={(e) => e.stopPropagation()}>
          <IconSwitch icon="kebab" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={(e) => {
            e.stopPropagation();
            openFeed(id);
          }}
          style={{ whiteSpace: "nowrap" }}
        >
          Добавить событие
        </Menu.Item>
        <Menu.Item component="a" href={`/snakes/edit/ballpython?id=${id}`}>
          Редактировать
        </Menu.Item>
        <Menu.Item
          onClick={(e) => {
            e.stopPropagation();
            openTrans(id);
          }}
        >
          Передать
        </Menu.Item>
        <Menu.Item
          c="var(--mantine-color-error)"
          onClick={(e) => {
            e.stopPropagation();
            openDelete(id);
          }}
        >
          Удалить
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

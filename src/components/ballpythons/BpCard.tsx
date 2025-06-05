import { useLocation } from "preact-iso";
import { FC } from "preact/compat";
import fallback from "@assets/placeholder.png";
import { Button, Flex, Image, Menu, Stack, Text } from "@mantine/core";
import { signal } from "@preact/signals";
import { IFeed, IResSnakesList } from "@/api/models";
import { getAge, getDate } from "../../utils/time";
import { SexName } from "../common/sexName";
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
interface IProp {
  body: IResSnakesList;
  handleTrans: () => void;
  handleEdit: () => void;
  handleFeed: () => void;
}
export const BpCard: FC<IProp> = ({ body, handleTrans, handleEdit, handleFeed }) => {
  const location = useLocation();
  const lastWeight = body.weight?.[body.weight?.length - 1];
  const lastFeed = body.feeding?.[body.feeding.length - 1];
  const lastShed = body.shed?.[body.shed.length - 1];
  return (
    <Flex columnGap="xl" rowGap="md" w="100%" maw="100%" wrap="nowrap">
      <Stack gap="xs" flex="0 0 196px" onClick={() => location.route(`/snakes/ballpython?id=${body.id}`)} style={{ cursor: "pointer" }}>
        <Image src={body.picture} flex="0 0 0px" fit="cover" radius="md" w="auto" maw="100%" h={110} fallbackSrc={fallback} loading="lazy" />
        <SexName sex={body.sex} name={body.snake_name} />
        <Text size="md">⌛ {getAge(body.date_hatch)}</Text>
      </Stack>
      <Stack gap="xs">
        <Text size="sm">Текущий вес: {lastWeight?.weight != null ? `${lastWeight.weight}г` : "Нет данных"}</Text>
        <Text size="sm">Последнее кормление: {calcFeedEvent(lastFeed)}</Text>
        <Text size="sm">Последняя линька: {lastShed != null ? `${getDate(lastShed)}` : "Нет данных"}</Text>
        <Flex wrap="wrap" gap="xs">
          {sortBpGenes(body.genes).map((a) => (
            <GenePill key={`${a.label}_${a.id}`} item={a} />
          ))}
        </Flex>
      </Stack>
    </Flex>
  );
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

export const BpControls = ({ id, openFeed, openTrans }) => {
  return (
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
      keepMounted={false}
    >
      <Menu.Target>
        <Button
          onClick={(e) => e.stopPropagation()}
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
      </Menu.Dropdown>
    </Menu>
  );
};

import { Flex, Menu, Stack, Text } from "@mantine/core";
import { IFeed } from "@/api/common";
import { getDate, getDateObj } from "../../utils/time";
import { codeToFeeder } from "../common/Feeder/const";
import { sortSnakeGenes } from "./genetics/const";
import { GenePill } from "./genetics/geneSelect";

export const calcFeedEvent = (feed?: IFeed, size = "sm") => {
  if (feed == null || feed?.feed_last_at == null) {
    return <span>Нет данных</span>;
  }
  let temp = "";
  if (feed?.feed_last_at != null) {
    temp = `${temp + getDate(feed?.feed_last_at!)}\n${feed?.feed_weight ? `Вес КО ${feed.feed_weight}г\n` : ""}${feed?.feed_ko ? `${codeToFeeder(feed.feed_ko)}` : ""}`;
  }

  if (feed?.regurgitation) {
    return (
      <>
        <Text style={{ whiteSpace: "pre-wrap" }} component="span" size={size}>
          {temp}
        </Text>
        {"  "}
        <Text fw={500} component="span" c="var(--mantine-color-error)" size={size}>
          Срыг
        </Text>
      </>
    );
  }

  if (feed?.refuse) {
    return (
      <>
        <Text style={{ whiteSpace: "pre-wrap" }} component="span" size={size}>
          {temp}
        </Text>
        {"  "}
        <Text fw={500} component="span" c="#00FFC0" size={size}>
          Отказ
        </Text>
      </>
    );
  }

  return (
    <Text style={{ whiteSpace: "pre-wrap" }} component="span" size={size}>
      {temp}
    </Text>
  );
};

export const GenesList = ({ genes, size = "sm" }) => (
  <Flex wrap="wrap" gap={size}>
    {sortSnakeGenes(genes).map((a) => (
      <GenePill key={`${a.label}_${a.id}`} item={a} size={size as any} />
    ))}
  </Flex>
);

export const SnakeEventsBlock = ({ feeding, weight, shed, isShowFeed = true, isShowShed = true, isShowWeight = true }) => {
  const lastWeight = weight?.sort((a, b) => getDateObj(a.date) - getDateObj(b.date))?.[weight?.length - 1];
  const lastFeed = feeding?.sort((a, b) => getDateObj(a.feed_last_at) - getDateObj(b.feed_last_at))?.[feeding.length - 1];
  const lastShed = shed?.sort((a, b) => getDateObj(a) - getDateObj(b))?.[shed.length - 1];

  return (
    <Stack gap="xs">
      {isShowWeight ? <Text size="sm">Текущий вес: {lastWeight?.weight != null ? `${lastWeight.weight}г` : "Нет данных"}</Text> : null}
      {isShowFeed ? <Text size="sm">Последнее кормление: {calcFeedEvent(lastFeed)}</Text> : null}
      {isShowShed ? <Text size="sm">Последняя линька: {lastShed != null ? `${getDate(lastShed)}` : "Нет данных"}</Text> : null}
    </Stack>
  );
};

export const Controls = ({ id, openFeed, openTrans, openDelete, category, children }) => {
  return (
    <Menu
      openDelay={200}
      shadow="md"
      width={164}
      transitionProps={{ transition: "rotate-left", duration: 150 }}
      trigger="click-hover"
      loop={false}
      withinPortal
      trapFocus={false}
      menuItemTabIndex={0}
      position="right-end"
      offset={8}
      withArrow
      arrowPosition="center"
      closeOnClickOutside
      keepMounted={false}
      zIndex={30}
    >
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component="a" href={`/snakes/${category}?id=${id}`}>
          На страницу змеи
        </Menu.Item>
        <Menu.Item
          onClick={(e) => {
            e.stopPropagation();
            openFeed(id);
          }}
          style={{ whiteSpace: "nowrap" }}
        >
          Добавить событие
        </Menu.Item>
        <Menu.Item component="a" href={`/snakes/edit/${category}?id=${id}`}>
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

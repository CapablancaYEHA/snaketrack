import { Menu } from "@mantine/core";
import { sigCurCat } from "./signals";

export const RemControls = ({ children, id, openFeed }) => {
  return (
    <Menu
      trigger="click-hover"
      openDelay={200}
      shadow="md"
      width={164}
      transitionProps={{ transition: "rotate-left", duration: 150 }}
      loop={false}
      trapFocus={false}
      menuItemTabIndex={0}
      position="right-end"
      offset={8}
      withArrow
      arrowPosition="center"
      closeOnClickOutside
      keepMounted={false}
    >
      <Menu.Target>{children}</Menu.Target>
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
        <Menu.Item component="a" href={`/snakes/${sigCurCat.value}?id=${id}`}>
          На страницу змеи
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

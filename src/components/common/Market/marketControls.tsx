import { Menu } from "@mantine/core";

export const MarketControls = ({ children, id, owner, cat }) => {
  const userId: string = localStorage.getItem("USER")!;
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
      position="right-start"
      offset={8}
      withArrow
      arrowPosition="center"
      closeOnClickOutside
      keepMounted={false}
      zIndex={30}
    >
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component="a" href={`/market/view/${cat}?id=${id}`}>
          Просмотр
        </Menu.Item>
        {userId === owner ? (
          <Menu.Item component="a" href={`/market/edit/${cat}?id=${id}`}>
            Редактировать
          </Menu.Item>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
};

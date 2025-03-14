import { FC } from "preact/compat";
import { Button, Loader, Menu, Space, Text } from "@mantine/core";
import { logout } from "../../api/profile/hooks";

interface IProps {
  title?: string;
}
//FIXME

export const HeadMenu: FC<IProps> = ({ title }) => {
  return (
    <Menu shadow="md" width={164} transitionProps={{ transition: "rotate-left", duration: 150 }} trigger="hover" loop={false} withinPortal={false} trapFocus={false} menuItemTabIndex={0} position="bottom-end" offset={6} withArrow arrowPosition="center">
      <Menu.Target>
        <Button variant="subtle" color="white">
          {/* {title} */}
          Аккаунт
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item href="/profile" component="a">
          Профиль
        </Menu.Item>
        <Space h="xs" />
        <Menu.Item onClick={logout}>Выйти</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

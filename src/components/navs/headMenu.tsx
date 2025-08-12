import { FC } from "preact/compat";
import { Box, Menu, Space, Text } from "@mantine/core";
import { logout } from "../../api/profile/hooks";

interface IProps {
  accName?: string;
}

export const HeadMenu: FC<IProps> = ({ accName }) => {
  return (
    <Menu
      shadow="md"
      width={164}
      transitionProps={{ transition: "rotate-left", duration: 150 }}
      trigger="click-hover"
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
        <Box style={{ cursor: "pointer" }}>
          <Text size="md" fw={700}>
            {accName ?? "Аккаунт"}
          </Text>
        </Box>
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

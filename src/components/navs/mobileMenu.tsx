import { useLocation } from "preact-iso";
import { Burger, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { renderLinks } from "./sidebar/Sidebar";

export const MobileMenu = () => {
  const { url } = useLocation();
  const [opened, { toggle }] = useDisclosure();
  return (
    <Menu shadow="md" width={164} transitionProps={{ transition: "rotate-left", duration: 150 }} trigger="click-hover" withinPortal={false} menuItemTabIndex={0} position="bottom-end" offset={18} withArrow arrowPosition="center" opened={opened}>
      <Menu.Target>
        <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
      </Menu.Target>
      <Menu.Dropdown>{renderLinks(url, true)}</Menu.Dropdown>
    </Menu>
  );
};

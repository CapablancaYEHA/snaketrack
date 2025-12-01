import { useLocation } from "preact-iso";
import { Stack, Text, alpha } from "@mantine/core";
import { sidebarLinks } from "../../route";
import { IconSwitch } from "./icons/switch";
import styles from "./styles.module.scss";

export const renderLinks = (url, alwaysShow = false, callback = undefined) =>
  sidebarLinks.map((a) => (
    <div key={a.id} class={styles.item} onClick={callback}>
      <a href={a.link} class={`${styles.link} ${url.includes(a.link) ? styles.active : ""} ${alwaysShow ? "" : styles.hidden}`}>
        <Text span size="xs">
          {a.label}
        </Text>
      </a>
      <section class={`${url.includes(a.link) ? styles.active : ""}`}>
        <IconSwitch icon={a.link.slice(1)} width="20" height="20" />
      </section>
    </div>
  ));

export const Sidebar = () => {
  const { url } = useLocation();

  return (
    <Stack
      id="layoutsdbr"
      bg="dark.8"
      component="aside"
      justify="start"
      gap="xs"
      className={styles.sidebar}
      style={{
        borderRight: `1px solid ${alpha(`var(--mantine-color-yellow-6)`, 0.4)}`,
      }}
    >
      {renderLinks(url)}
    </Stack>
  );
};

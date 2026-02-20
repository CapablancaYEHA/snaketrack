import { Anchor, Box, Flex, Text, alpha } from "@mantine/core";
import { getDateCustom } from "@/utils/time";
import { IconSwitch } from "./sidebar/icons/switch";
import styles from "./styles.module.scss";

const req = import.meta.env.VITE_REACT_APP_YOO_REQ;

export function Footer() {
  return (
    <Box
      px="sm"
      py="4px"
      className={styles.footer}
      id="layouthftr"
      bg="dark.8"
      style={{
        borderTop: `1px solid ${alpha(`var(--mantine-color-yellow-6)`, 0.4)}`,
      }}
    >
      <Flex gap="sm" align="center" justify="space-between" component="footer">
        <Text size="xs" fw={500} c="dark.2">
          © 2025–{getDateCustom(new Date(), "YYYY")} snaketrack.ru
        </Text>
        {/* <Anchor href="https://t.me/CapablancaRUS" target="_blank" rel="nofollow noopener noreferrer" underline="never">
          <IconSwitch icon="telegram" width="18" height="18" />
        </Anchor> */}
        <Anchor href="https://vk.com/hissstory" target="_blank" rel="nofollow noopener noreferrer" underline="never">
          <IconSwitch icon="vk" width="18" height="18" />
        </Anchor>
        <Anchor href={`https://yoomoney.ru/fundraise/${req}`} target="_blank" rel="nofollow noopener noreferrer" underline="never" inline size="xs" fw={500}>
          Задонатить на кофе 💓
        </Anchor>
      </Flex>
    </Box>
  );
}

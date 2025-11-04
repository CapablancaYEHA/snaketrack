import { Anchor, Box, Flex, Text, alpha } from "@mantine/core";
import { getDateCustom } from "@/utils/time";
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
      <Flex gap="sm" align="center" component="footer">
        <Text size="xs" fw={500} c="dark.2">
          © {getDateCustom(new Date(), "YYYY")} snaketrack.ru
        </Text>
        <Anchor onClick={() => fetch} href={`https://yoomoney.ru/fundraise/${req}`} target="_blank" rel="nofollow noopener noreferrer" underline="never" inline size="xs" fw={500} ml="auto">
          Задонатить на кофе 💓
        </Anchor>
      </Flex>
    </Box>
  );
}

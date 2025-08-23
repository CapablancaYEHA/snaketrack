import { Anchor, Box } from "@mantine/core";
import { footLinks } from "./const";
import styles from "./styles.module.scss";

export function Footer() {
  return (
    <Box bg="dark.5" component="footer" px="xl" className={styles.wrap}>
      <div style={{ gap: "24px", justifyContent: "flex-end" }}>
        <Anchor href="/rules" underline="never" c="white" inline size="xs" fw={500} mr="auto">
          ПРАВИЛА
        </Anchor>
        {footLinks.map((a) => (
          <Anchor href={a.href} underline="never" c="white" inline size="xs" style={{ fontWeight: 500 }} key={`${a.name}_${a.href}`}>
            {a.name.toUpperCase()}
          </Anchor>
        ))}
      </div>
    </Box>
  );
}

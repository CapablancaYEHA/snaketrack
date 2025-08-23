import { Box, List, Modal, Stack, Text } from "@mantine/core";
import { getDate } from "@/utils/time";
import { versionHistory } from "./const";
import styles from "./styles.module.scss";

export const ReleasesHistory = ({ opened, close }) => {
  return (
    <Modal opened={opened} onClose={close} title={<Text size="sm">Релизы</Text>} centered transitionProps={{ transition: "fade", duration: 200 }} keepMounted={false}>
      <Stack gap="md">
        {versionHistory.map((a) => (
          <Box key={a.id}>
            <Text size="sm" component="div">
              v{a.ver}
              <Text size="xs" c="dark.2" component="div">
                {getDate(a.date)}
              </Text>
            </Text>
            <List size="xs">
              {a.list.map((b, ind) => (
                <List.Item className={styles.itm} key={ind}>
                  {b}
                </List.Item>
              ))}
            </List>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
};

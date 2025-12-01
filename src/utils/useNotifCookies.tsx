import { useEffect, useState } from "preact/hooks";
import { Anchor, Button, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

const Agr = ({ handle }) => (
  <Stack gap="sm" align="center">
    <Text size="xs" fw={500}>
      Оставаясь на&nbsp;сайте, вы соглашаетесь с&nbsp;данным фактом и&nbsp;
      <Anchor href="/terms" underline="always" c="inherit" fw={500} target="_blank" rel="noreferrer">
        условиями
      </Anchor>
    </Text>
    <Button size="compact-xs" onClick={handle}>
      Понятно
    </Button>
  </Stack>
);

export function useNotifCookies() {
  const k = localStorage.getItem("COOK_AGREE") !== "accepted";
  const [isShow, setShow] = useState(k ?? true);

  useEffect(() => {
    if (isShow) {
      const ident = notifications.show({
        id: "hello-there",
        position: "bottom-center",
        withCloseButton: false,
        withBorder: true,
        autoClose: false,
        title: "Мы используем cookies",
        message: (
          <Agr
            handle={() => {
              localStorage.setItem("COOK_AGREE", "accepted");
              setShow(false);
              notifications.hide(ident);
            }}
          />
        ),
        color: "orange",
        loading: false,
      });
    }
  }, [isShow]);
}

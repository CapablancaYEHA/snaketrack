import { useEffect, useState } from "preact/hooks";
import { mediaBrowser } from "@/styles/theme";
import chrome from "@assets/chrome_instr.png";
import saf from "@assets/safari_instr.png";
import { Button, Image, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

const Informed = ({ handle, platform }) => {
  const text = platform === "ios" ? "Safari" : "Chrome или Firefox";
  const pic = platform === "ios" ? saf : chrome;
  return (
    <Stack gap="sm" align="end">
      <Text size="xs" fw={500}>
        В {text} вызовите меню браузера.
        <br />
        По примерам на скриншотах установите snaketrack на главный экран.
        <br />
        Далее трекер можно вызывать как нативное приложение и не заходить в браузер.
      </Text>
      <Image src={pic} fit="cover" radius="sm" maw="100%" w="100%" loading="lazy" />
      <Button size="compact-xs" onClick={handle}>
        Понятно
      </Button>
    </Stack>
  );
};

export function usePwaInformer() {
  const k = localStorage.getItem("PWA_INFO") !== "accepted";
  const isBrowser = useMediaQuery(mediaBrowser);
  const [isShow, setShow] = useState(!isBrowser && (k ?? true));
  const ua = navigator.userAgent;
  const iOS = ua.match(/iPhone|iPad|iPod/);
  const andr = ua.match(/Android/);

  const platform = iOS ? "ios" : andr ? "android" : "desktop";

  useEffect(() => {
    if (isShow && platform !== "desktop") {
      const ident = notifications.show({
        id: "hello-there",
        position: "top-center",
        withCloseButton: false,
        withBorder: true,
        autoClose: false,
        title: "Используйте как приложение",
        message: (
          <Informed
            handle={() => {
              localStorage.setItem("PWA_INFO", "accepted");
              setShow(false);
              notifications.hide(ident);
            }}
            platform={platform}
          />
        ),
        color: "blue",
        loading: false,
        mih: 400,
        mah: "none",
      });
    }
  }, [isShow, platform]);
}

import { useLayoutEffect } from "preact/hooks";
import { Box, List } from "@mantine/core";

export function Cookies() {
  let trg = document.getElementById("layoutsdbr");
  useLayoutEffect(() => {
    let trgH = document.getElementById("layouthdr");
    trg?.classList.add("hide");
    trgH?.classList.add("hide");

    return () => {
      trg?.classList.remove("hide");
      trgH?.classList.remove("hide");
    };
  }, [trg]);

  return (
    <Box>
      <List>
        <strong>Политика использования файлов cookie</strong>
        <List.Item>
          Наш сайт использует файлы cookie и похожие технологии, чтобы гарантировать максимальное удобство пользователям, предоставляя персонализированную информацию, запоминая предпочтения в области маркетинга и продукции, а также помогая получить правильную
          информацию.
        </List.Item>
        <List.Item>При использовании данного сайта, вы подтверждаете свое согласие на использование файлов cookie в соответствии с настоящим уведомлением в отношении данного типа файлов.</List.Item>
        <List.Item>Если вы не согласны с тем, чтобы мы использовали данный тип файлов, то вы должны соответствующим образом установить настройки вашего браузера или не использовать данный сайт.</List.Item>
      </List>
    </Box>
  );
}

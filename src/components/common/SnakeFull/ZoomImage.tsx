import { useEffect } from "preact/hooks";
import fallback from "@assets/placeholder.webp";
import { CloseButton, Image, Overlay } from "@mantine/core";

// FIXME переписать на npm medium-zoom ?
export const ZoomImage = ({ onClose, pic }) => {
  useEffect(() => {
    let v = document.querySelector("meta[name=viewport]");

    v?.setAttribute("content", "user-scalable=yes, initial-scale=1, width=device-width, height=device-height, viewport-fit=cover");

    return () => {
      v?.setAttribute("content", "user-scalable=no, initial-scale=1, width=device-width, height=device-height, viewport-fit=cover");
    };
  }, []);

  return (
    <Overlay color="#000" backgroundOpacity={1} fixed center>
      <CloseButton onClick={onClose} size="lg" pos="absolute" top="16px" right="16px" />
      <Image src={pic} fit="cover" w="auto" maw="100%" fallbackSrc={fallback} loading="lazy" id="img-zoomable" />
    </Overlay>
  );
};

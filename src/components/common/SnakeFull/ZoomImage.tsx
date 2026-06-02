import { useEffect, useRef } from "preact/hooks";
import fallback from "@assets/placeholder.webp";
import { ActionIcon, AspectRatio, Image } from "@mantine/core";
import mediumZoom, { Zoom } from "medium-zoom";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { urlProxyReplace } from "@/utils/other";

// FIXME по факту это надо переделывать на другую либу
const opts = {
  margin: 0,
  background: "#000000",
  scrollOffset: 40,
};

export const ZoomImage = ({ pic, radius = "md" }) => {
  let mainTgt = document.querySelector("meta[name=viewport]");
  const zoomRef = useRef<Zoom | null>(null);

  function getZoom() {
    if (zoomRef.current === null) {
      zoomRef.current = mediumZoom(opts);
    }

    return zoomRef.current;
  }

  const attachZoom: any = (node) => {
    const zoom = getZoom();

    if (node) {
      zoom.attach(node);
    } else {
      zoom.detach();
    }
  };

  useEffect(() => {
    zoomRef.current?.on(
      "open",
      () => {
        mainTgt?.setAttribute("content", "user-scalable=yes, initial-scale=1, width=device-width, height=device-height, viewport-fit=cover");
      },
      { once: false },
    );

    zoomRef.current?.on("closed", () => {
      mainTgt?.setAttribute("content", "user-scalable=no, initial-scale=1, width=device-width, height=device-height, viewport-fit=cover");
    });
  }, []);

  return (
    <>
      <ActionIcon variant="default" size="md" onClick={() => zoomRef?.current?.open?.()} pos="absolute" bottom="8px" right="8px">
        <IconSwitch icon="zoom" width="18" height="18" />
      </ActionIcon>
      <AspectRatio ratio={3 / 2} maw="100%">
        <Image
          src={urlProxyReplace(pic)}
          //   data-zoom-src={urlProxyReplace(pic)}
          fit="cover"
          radius={radius}
          w="auto"
          maw="100%"
          fallbackSrc={fallback}
          loading="lazy"
          data-zoomable
          ref={attachZoom}
          style={{ zIndex: 31 }}
          // mah={{ base: "180px", sm: "260px" }}
        />
      </AspectRatio>
    </>
  );
};

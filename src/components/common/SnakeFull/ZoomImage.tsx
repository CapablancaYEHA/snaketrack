import { useEffect, useRef } from "preact/hooks";
import fallback from "@assets/placeholder.webp";
import { ActionIcon, AspectRatio, Box, Image } from "@mantine/core";
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { urlProxyReplace } from "@/utils/other";

export const ZoomImage = ({ pic, radius = "md", w = "auto" }) => {
  const lightRef = useRef<any>(null);

  useEffect(() => {
    lightRef.current = GLightbox({
      loop: false,
      autoplayVideos: false,
      zoomable: true,
      draggable: false,
      touchNavigation: true,
      dragToleranceY: 5,
      elements: [
        {
          href: urlProxyReplace(pic),
          type: "image",
          width: "100vw",
        },
      ] as any,
    });

    return () => {
      lightRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      maw="100%"
      w="100%"
      pos="relative"
      onClick={(e) => {
        e.stopPropagation();
        lightRef.current?.open();
      }}
      style={{ cursor: "pointer" }}
    >
      <AspectRatio ratio={3 / 2} maw="100%">
        <Image
          src={urlProxyReplace(pic)}
          fit="cover"
          radius={radius}
          w={w}
          maw="100%"
          fallbackSrc={fallback}
          loading="lazy"
          // mah={{ base: "180px", sm: "260px" }}
        />
      </AspectRatio>
      <ActionIcon variant="default" size="md" pos="absolute" bottom="8px" right="8px" w={8}>
        <IconSwitch icon="zoom" width="18" height="18" />
      </ActionIcon>
    </Box>
  );
};

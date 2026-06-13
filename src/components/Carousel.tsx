import { useEffect, useRef, useState } from "preact/hooks";
import fallback from "@assets/placeholder.webp";
import { Carousel as Car } from "@mantine/carousel";
import { ActionIcon, AspectRatio, Box, Image } from "@mantine/core";
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import { urlProxyReplace } from "@/utils/other";
import { IconSwitch } from "./navs/sidebar/icons/switch";

export const Carousel = ({ images }) => {
  const [active, setActive] = useState<number>(0);
  const lightRef = useRef<any>(null);
  const kek = images.map((a) => ({
    href: urlProxyReplace(a),
    type: "image",
    // width: "100vw",
  }));

  useEffect(() => {
    lightRef.current = GLightbox({
      keyboardNavigation: true,
      closeOnOutsideClick: true,
      touchNavigation: true,
      touchFollowAxis: true,
      elements: kek,
      loop: true,
      dragToleranceY: 20,
      startAt: active,
    });

    return () => {
      lightRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Box maw="100%" w="100%" pos="relative">
      <Car
        onSlideChange={(i) => setActive(i)}
        withIndicators={images.length > 1}
        miw={250}
        maw="100%"
        w="100%"
        height="auto"
        slideSize="100%"
        controlsOffset="md"
        controlSize={26}
        withControls={images.length > 1}
        type="container"
        emblaOptions={{ loop: true, dragFree: false }}
      >
        {images?.map((p, ind) => (
          <Car.Slide key={ind}>
            <AspectRatio ratio={3 / 2} maw="100%">
              <Image src={urlProxyReplace(p)} fit="cover" w="100%" maw="100%" fallbackSrc={fallback} loading="lazy" radius="md" />
            </AspectRatio>
          </Car.Slide>
        ))}
      </Car>
      <ActionIcon
        variant="default"
        size="md"
        pos="absolute"
        bottom="8px"
        right="8px"
        w={8}
        onClick={(e) => {
          e.stopPropagation();
          lightRef.current?.open();
        }}
      >
        <IconSwitch icon="zoom" width="18" height="18" />
      </ActionIcon>
    </Box>
  );
};

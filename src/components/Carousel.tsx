import { Carousel as Car } from "@mantine/carousel";
import { urlProxyReplace } from "@/utils/other";
import { ZoomImage } from "./common/SnakeFull/ZoomImage";

// аспект был 3/2,maw отсут, а у имиджа было h="auto" без maw и w
export const Carousel = ({ images }) => {
  return (
    <Car withIndicators={images.length > 1} miw={250} maw="100%" w="100%" height="auto" slideSize="100%" controlsOffset="md" controlSize={26} withControls={images.length > 1} type="container" emblaOptions={{ loop: true, dragFree: false }}>
      {images?.map((p, ind) => (
        <Car.Slide key={ind}>
          <ZoomImage pic={urlProxyReplace(p)} radius="sm" />
        </Car.Slide>
      ))}
    </Car>
  );
};

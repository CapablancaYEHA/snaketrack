import fallback from "@assets/placeholder.png";
import { Carousel as Car } from "@mantine/carousel";
import { AspectRatio, Image } from "@mantine/core";
import css from "./styles.module.scss";

export const Carousel = ({ images }) => {
  return (
    <Car withIndicators={images.length > 1} miw={250} maw="100%" w="100%" height="auto" slideSize="100%" controlsOffset="md" controlSize={26} withControls={images.length > 1} type="container" dragFree={false} loop className={css.carousel}>
      {images?.map((p, ind) => (
        <Car.Slide key={ind} className={css.carousel}>
          <AspectRatio ratio={16 / 9}>
            <Image src={p} fit="cover" radius="sm" h="auto" fallbackSrc={fallback} />
          </AspectRatio>
        </Car.Slide>
      ))}
    </Car>
  );
};

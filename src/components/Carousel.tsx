import { Carousel as Car } from "@mantine/carousel";
import "glightbox/dist/css/glightbox.css";
import { urlProxyReplace } from "@/utils/other";
import { ZoomImage } from "./common/SnakeFull/ZoomImage";

// аспект был 3/2,maw отсут, а у имиджа было h="auto" без maw и w
export const Carousel = ({ images }) => {
  return (
    <Car withIndicators={images.length > 1} miw={250} maw="100%" w="100%" height="auto" slideSize="100%" controlsOffset="md" controlSize={26} withControls={images.length > 1} type="container" emblaOptions={{ loop: true, dragFree: false }}>
      {images?.map((p, ind) => (
        <Car.Slide key={ind}>
          <ZoomImage pic={urlProxyReplace(p)} radius="sm" w="100%" />
        </Car.Slide>
      ))}
    </Car>
  );
};

// export const Carousel = ({ images }) => {
//   const lightRef = useRef<any>(null);
//   const kek = images.map((a) => ({
//     href: urlProxyReplace(a),
//     type: "image",
//     // width: "100vw",
//   }));

//   useEffect(() => {
//     console.log("elements", kek);
//     lightRef.current = GLightbox({
//       keyboardNavigation: true,
//       //   closeOnOutsideClick: true,
//       //   zoomable: true,
//       //   draggable: true,
//       touchNavigation: true,
//       touchFollowAxis: true,
//       elements: kek,
//       loop: true,
//       //   width: "100vw",
//     });

//     return () => {
//       lightRef.current.destroy();
//     };
//   }, []);

//   return (
//     <Box
//       maw="100%"
//       w="100%"
//       onClick={(e) => {
//         e.stopPropagation();
//         lightRef.current?.open();
//       }}
//     >
//       <AspectRatio ratio={3 / 2} maw="100%">
//         <Image
//           src={urlProxyReplace(images[0])}
//           fit="cover"
//           w="100%"
//           maw="100%"
//           fallbackSrc={fallback}
//           loading="lazy"
//           style={{ zIndex: 31 }}
//           // mah={{ base: "180px", sm: "260px" }}
//         />
//       </AspectRatio>
//     </Box>
//   );
// };

import { useEffect, useRef } from "preact/hooks";
import { Flex, Text } from "@mantine/core";
import { CountUp } from "countup.js";

export const RollNumber = ({ val, size = "xs" }) => {
  let countRef = useRef<any>(null);
  const mountRef = useRef(null);

  useEffect(() => {
    if (mountRef.current) {
      countRef.current = new CountUp(mountRef.current, val, { useEasing: false, autoAnimate: true, autoAnimateOnce: true, duration: 2, separator: " ", prefix: "₽ ", onCompleteCallback: countRef?.current?.onDestroy?.() });
    }
  }, [val]);

  return (
    <Flex wrap="nowrap" gap="3px">
      <Text size={size} ta="left" w="100%" ref={mountRef} />
    </Flex>
  );
};

import { Flex, Text } from "@mantine/core";
import { IconSwitch } from "../navs/sidebar/icons/switch";

export const SexName = ({ sex, name, size = "lg" }) => {
  return (
    <Flex gap="4px" style={{ display: "inline-flex" }} align="center">
      <IconSwitch icon={sex} width="16" height="16" />
      <Text size={size} inline>
        {name}
      </Text>
    </Flex>
  );
};

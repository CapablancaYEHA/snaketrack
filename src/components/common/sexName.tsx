import { Flex, Text } from "@mantine/core";
import { IconSwitch } from "../navs/sidebar/icons/switch";

export const SexName = ({ sex, name }) => {
  return (
    <Flex gap="4px" align="center" style={{ display: "inline-flex" }}>
      <IconSwitch icon={sex} width="16" height="16" />
      <Text size="lg">{name}</Text>
    </Flex>
  );
};

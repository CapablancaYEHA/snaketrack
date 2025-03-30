import { Flex, Text } from "@mantine/core";
import { IconSwitch } from "../navs/sidebar/icons/switch";

export const SexName = ({ sex, name }) => {
  return (
    <Flex gap="4px" style={{ display: "inline-flex" }}>
      <IconSwitch icon={sex} width="16" height="16" style={{ position: "relative", bottom: -4 }} />
      <Text size="xl" inline>
        {name}
      </Text>
    </Flex>
  );
};

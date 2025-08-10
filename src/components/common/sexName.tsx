import { Anchor, Flex, Text } from "@mantine/core";
import { IconSwitch } from "../navs/sidebar/icons/switch";

export const SexName = ({ sex, name, size = "lg", isLink = false }) => {
  return (
    <Flex gap="4px" style={{ display: "inline-flex" }} align="center" px={0}>
      <IconSwitch icon={sex} width="16" height="16" />
      {isLink ? (
        <Anchor size={size} underline="not-hover" c="inherit">
          {name}
        </Anchor>
      ) : (
        <Text size={size} inline>
          {name}
        </Text>
      )}
    </Flex>
  );
};

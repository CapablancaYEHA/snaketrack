import { Anchor, Flex, Text } from "@mantine/core";
import { IconSwitch } from "../navs/sidebar/icons/switch";

export const SexName = ({ sex, name, size = "md", isLink = false, inline = true }) => {
  return (
    <Flex gap="4px" style={inline ? { display: "inline-flex" } : {}} px={0}>
      <IconSwitch icon={sex} width="16" height="16" style={{ flex: "0 0 16px" }} />
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

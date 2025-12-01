import { Fragment } from "preact/jsx-runtime";
import { Box, Flex, Skeleton, Space, Stack } from "@mantine/core";

export const SkelTable = () => (
  <>
    <Flex>
      <Skeleton height={16} radius="xl" miw={16} flex="0 0 100px" />
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Box flex="1 1 1%" h={16} />
      <Skeleton height={16} mb={6} radius="xl" miw={16} flex="1 1 0px" />
      <Skeleton height={16} mb={6} radius="xl" miw={16} flex="1 1 0px" />
      <Skeleton height={16} mb={6} radius="xl" miw={16} flex="1 1 0px" />
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Skeleton height={110} radius="md" flex="1 1 1%" />
      <Box flex="1 1 0px">
        <Skeleton height={16} radius="xl" mt={8} miw={16} />
      </Box>
      <Box flex="1 1 0px">
        <Skeleton height={16} mb={6} radius="xl" mt={8} miw={16} />
        <Skeleton height={16} mb={6} radius="xl" />
        <Skeleton height={16} mb={6} radius="xl" />
      </Box>
      <Flex gap="xs" flex="1 1 0px" mt={8}>
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
      </Flex>
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Skeleton height={110} radius="md" flex="1 1 1%" />
      <Box flex="1 1 0px">
        <Skeleton height={16} radius="xl" mt={8} miw={16} />
      </Box>
      <Box flex="1 1 0px">
        <Skeleton height={16} mb={6} radius="xl" mt={8} miw={16} />
        <Skeleton height={16} mb={6} radius="xl" />
        <Skeleton height={16} mb={6} radius="xl" />
      </Box>
      <Flex gap="xs" flex="1 1 0px" mt={8}>
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
      </Flex>
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Skeleton height={110} radius="md" flex="1 1 1%" />
      <Box flex="1 1 0px">
        <Skeleton height={16} radius="xl" mt={8} miw={16} />
      </Box>
      <Box flex="1 1 0px">
        <Skeleton height={16} mb={6} radius="xl" mt={8} miw={16} />
        <Skeleton height={16} mb={6} radius="xl" />
        <Skeleton height={16} mb={6} radius="xl" />
      </Box>
      <Flex gap="xs" flex="1 1 0px" mt={8}>
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
      </Flex>
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Skeleton height={110} radius="md" flex="1 1 1%" />
      <Box flex="1 1 0px">
        <Skeleton height={16} radius="xl" mt={8} miw={16} />
      </Box>
      <Box flex="1 1 0px">
        <Skeleton height={16} mb={6} radius="xl" mt={8} miw={16} />
        <Skeleton height={16} mb={6} radius="xl" />
        <Skeleton height={16} mb={6} radius="xl" />
      </Box>
      <Flex gap="xs" flex="1 1 0px" mt={8}>
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
      </Flex>
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Skeleton height={110} radius="md" flex="1 1 1%" />
      <Box flex="1 1 0px">
        <Skeleton height={16} radius="xl" mt={8} miw={16} />
      </Box>
      <Box flex="1 1 0px">
        <Skeleton height={16} mb={6} radius="xl" mt={8} miw={16} />
        <Skeleton height={16} mb={6} radius="xl" />
        <Skeleton height={16} mb={6} radius="xl" />
      </Box>
      <Flex gap="xs" flex="1 1 0px" mt={8}>
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
      </Flex>
    </Flex>
    <Flex wrap="nowrap" w="100%" gap="md">
      <Skeleton height={110} radius="md" flex="1 1 1%" />
      <Box flex="1 1 0px">
        <Skeleton height={16} radius="xl" mt={8} miw={16} />
      </Box>
      <Box flex="1 1 0px">
        <Skeleton height={16} mb={6} radius="xl" mt={8} miw={16} />
        <Skeleton height={16} mb={6} radius="xl" />
        <Skeleton height={16} mb={6} radius="xl" />
      </Box>
      <Flex gap="xs" flex="1 1 0px" mt={8}>
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
        <Skeleton height={16} radius="xl" flex="1" miw={16} />
      </Flex>
    </Flex>
  </>
);

export const SkelShedule = () => (
  <>
    <Stack align="center" w="100%" gap="sm">
      {/* <Skeleton height={16} radius="xl" maw="30%" /> */}
      <Stack w="100%" maw={260} gap="17px">
        {Array(7)
          .fill(" ")
          .map((a, ind) => (
            <Skeleton height={20} radius="xl" w="100%" key={ind} />
          ))}
      </Stack>
    </Stack>
    <Space h={114} />
    {Array(4)
      .fill(" ")
      .map((b, indx, self) => (
        <Fragment key={indx}>
          <Flex maw="100%" w="100%" gap="sm">
            <Stack flex="0 1 230px" gap="sm" align="end">
              <Skeleton height={72} radius="sm" miw={190} />
              <Skeleton height={16} radius="md" w="80%" />
            </Stack>
            <Stack flex="0 1 230px" gap="md">
              <Skeleton height={20} radius="sm" w="70%" />
              <Skeleton height={20} radius="sm" w="100%" />
            </Stack>
          </Flex>
          {indx !== self.length - 1 ? <Space h="md" /> : null}
        </Fragment>
      ))}
  </>
);

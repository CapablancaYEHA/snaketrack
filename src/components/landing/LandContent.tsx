import { Carousel } from "@mantine/carousel";
import { Box, Button, Flex, Image, Paper, Space, Stack, Text, Title } from "@mantine/core";
import { logoUri } from "@/components/navs/const";
import { features, pics, subfeatures } from "./const";
import css from "./styles.module.scss";

export const LandContent = () => {
  return (
    <Stack align="center" justify="flex-start" gap="sm" maw="100%" w="100%">
      <Flex gap="xs" align="center">
        <Image src={logoUri} fit="cover" w="36" h="36" />
        <Title component="span" order={2}>
          SnakeTrack
        </Title>
      </Flex>
      <Box maw="100%" w="100%">
        <Text fw={500} ta="center" size="xl">
          Собирайте данные, создавайте историю
        </Text>
      </Box>

      <Flex maw="80%" w="100%" gap="xl" align="center" justify="center">
        <Button fullWidth={false} component="a" href="/register" variant="default" size="compact-xs">
          Регистрация
        </Button>
        <Button fullWidth={false} component="a" href="/login" size="compact-xs">
          Вход
        </Button>
      </Flex>
      <Space h="sm" />
      {features.map((f, ind) => (
        <Paper shadow="sm" radius="md" px="lg" py="sm" maw="100%" w="100%" key={f.id}>
          <Flex align="center" gap="xs" className={css.adapt}>
            <Image radius="sm" src={pics[ind]} alt={f.head} fit="cover" loading="lazy" />
            <Stack align="center" gap="4px">
              <Title order={5} ta="center">
                {f.head}
              </Title>
              <Text ta="center" size="sm">
                {f.body}
              </Text>
            </Stack>
          </Flex>
        </Paper>
      ))}
      <Space h="sm" />
      <Text ta="center" w="100%" fw={500} size="lg">
        Но и это еще не всё
      </Text>
      <Carousel maw="100%" w="100%" height="auto" slideSize="100%" controlsOffset="0px" controlSize={14} withControls type="container" emblaOptions={{ loop: true, dragFree: false }}>
        {subfeatures.map((a, i) => (
          <Carousel.Slide key={i} maw="100%" w="100%" px="lg">
            <Text ta="center">{a}</Text>
          </Carousel.Slide>
        ))}
      </Carousel>
      <Space h="md" />
    </Stack>
  );
};

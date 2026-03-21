import { useState } from "preact/hooks";
import { Box, Button, Flex, Image, Loader, NumberFormatter, Space, Stack, Text, TextInput } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { useForm } from "react-hook-form";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { IVkMarketItem } from "@/api/common";
import { useVkMarket } from "@/api/misc/hooks";

export const FormImportVk = () => {
  const { data, mutate, isPending } = useVkMarket();

  const [allsnakes, setSnakes] = useState<IVkMarketItem[] | undefined>(undefined);

  const {
    register,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {} as any,
    resolver: {} as any,
  });

  return (
    <div>
      <TextInput {...register("group_name")} required label="Название группы" error={errors?.snake_name?.message} flex="1 1 50%(" />
      <Button size="compact-xs" variant="default" onClick={() => mutate(getValues("group_name"), { onSuccess: (res) => setSnakes(res) })}>
        выгрузить
      </Button>
      {isPending ? <Loader color="dark.1" size="sm" d="block" w="100%" /> : null}
      <Space h="xl" />
      <Stack gap="xl">
        {!isEmpty(allsnakes)
          ? allsnakes?.map((itm) => (
              <Flex gap="xs" key={itm.id} pos="relative">
                <Stack gap="xs" flex="1 1 50%">
                  <Text size="xs">{itm.title}</Text>
                  <NumberFormatter prefix="₽ " value={Number(itm.price.amount) / 100} thousandSeparator=" " />
                </Stack>
                <Image src={itm.thumb_photo} fit="cover" radius="sm" h={100} />
                <Box onClick={() => setSnakes((n: any) => n?.filter((elem) => elem.id !== itm.id))} style={{ cursor: "pointer" }}>
                  <IconSwitch icon="bin" width="18" height="18" />
                </Box>
              </Flex>
            ))
          : null}
      </Stack>
    </div>
  );
};

import { FC } from "preact/compat";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Flex, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ESupabase } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { IResProfile, IUpdProfileReq } from "@/api/profile/models";
import { notif } from "@/utils/notif";
import styles from "./styles.module.scss";

export const makeContacts = (profile?: IResProfile) => ({
  contacts_group: profile?.contacts_group,
  contacts_telegram: profile?.contacts_telegram,
  contacts_website: profile?.contacts_website,
});
const schemaContacts = yup.object().shape({
  contacts_group: yup
    .string()
    .nullable()
    .test("test_group", "Должно быть https://...", (v) => (!v ? true : v.startsWith("http"))),
  contacts_telegram: yup
    .string()
    .nullable()
    .test("test_telegram", "Некорректный формат", (v) => (!v ? true : /^@?[a-z\d_]+$/i.test(v))),
  contacts_website: yup
    .string()
    .nullable()
    .test("test_group", "Должно быть https://...", (v) => (!v ? true : v.startsWith("http"))),
});

type IContactsScheme = yup.InferType<typeof schemaContacts>;

interface IProp {
  init: any;
  id: string;
}

export const UpdateContacts: FC<IProp> = ({ init, id }) => {
  const { mutate, isPending } = useSupaUpd<IUpdProfileReq>(ESupabase.PROF);
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<IContactsScheme>({
    defaultValues: init,
    resolver: yupResolver(schemaContacts),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSub = (sub) => {
    mutate(
      {
        id,
        upd: {
          contacts_group: sub.contacts_group,
          contacts_telegram: sub.contacts_telegram,
          contacts_website: sub.contacts_website,
        },
      },
      {
        onSuccess: () => {
          notif({ c: "green", t: "Успешно", m: "Контакты сохранены" });
        },
        onError: (err) => {
          notif({ c: "red", m: err.message });
        },
      },
    );
  };

  return (
    <Stack gap="xs" maw="100%" w="100%">
      <Flex align="flex-start" maw="100%" w="100%" className={styles.w70} gap="lg">
        <Controller
          name="contacts_group"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput label="Группа в VK" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} />;
          }}
        />
        <Controller
          name="contacts_telegram"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput label="Ник в Телеге" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} placeholder="юзернейм" />;
          }}
        />
        <Controller
          name="contacts_website"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return <TextInput label="Web-site" flex="1 1 auto" error={error?.message} value={value as any} onChange={onChange} />;
          }}
        />
      </Flex>
      <Box>
        <Button fullWidth={false} size="compact-xs" variant="default" ml="auto" onClick={handleSubmit(onSub)} loading={isPending} disabled={!isDirty || isPending}>
          Сохранить контакты
        </Button>
      </Box>
    </Stack>
  );
};

import { FC, useState } from "preact/compat";
import { Box, Flex, Modal, Pill, Space, Stack, TagsInput, Text, Title } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { Btn } from "@/components/navs/btn/Btn";
import { ESupabase, IResSnakesList, IUpdReq } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";
import { IUpdProfileReq } from "@/api/profile/models";
import { notif } from "@/utils/notif";
import { SexName } from "../../sexName";

type IProp = {
  opened: boolean;
  close: () => void;
  snake?: IResSnakesList;
  snakeTable: ESupabase;
};

export const SnakeTags: FC<IProp> = ({ opened, close, snake, snakeTable }) => {
  const userId = localStorage.getItem("USER");
  const { data: profile } = useProfile(userId, userId != null);
  const { mutate, isPending } = useSupaUpd<IUpdProfileReq>(ESupabase.PROF);
  const { mutate: updSnake, isPending: isUpdPend } = useSupaUpd<IUpdReq>(snakeTable);
  const [tags, setTags] = useState<string[] | undefined>([]);
  const [snakeMarkDel, setSnakeDel] = useState<string[]>([]);
  const [profileMarkDel, setProfileDel] = useState<string[]>([]);

  const submit = () => {
    mutate(
      {
        id: userId!,
        upd: {
          snake_tags: (profile?.snake_tags ?? []).concat(tags ?? []).filter((a, indx, self) => !profileMarkDel?.includes(a) && self.indexOf(a) === indx),
        },
      },
      {
        onSuccess: () => {
          updSnake(
            {
              upd: {
                tags: (snake?.tags ?? []).concat(tags ?? []).filter((a, indx, self) => !snakeMarkDel?.includes(a) && self.indexOf(a) === indx),
                last_action: "update",
              },
              id: snake?.id!,
            },
            {
              onSuccess: () => {
                close();
                setTags(undefined);
                setSnakeDel([]);
                setProfileDel([]);
              },
              onError: (err) => {
                notif({ c: "red", m: err.message });
              },
            },
          );
        },
      },
    );
  };

  const isDirty = !isEmpty(profileMarkDel) || !isEmpty(snakeMarkDel) || !isEmpty(tags);
  const noAssigned = (profile?.snake_tags ?? []).filter((ass) => !snake?.tags?.includes(ass));

  return (
    <Modal opened={opened} onClose={close} centered transitionProps={{ transition: "fade", duration: 200 }} title={<Title order={4}>Тэги. Создание, присвоение, удаление</Title>} keepMounted={false}>
      <Stack gap="xs">
        <Box>
          <Text align="center" component={Flex} gap="4px">
            <SexName sex={snake?.sex} name={snake?.snake_name} size="md" />
            уже имеет тэги:
          </Text>
          {isEmpty(snake?.tags) ? (
            <Text size="xs">пусто</Text>
          ) : (
            <Flex gap="xs" wrap="wrap">
              {snake?.tags?.map((tag, ind) => (
                <Pill
                  key={`${tag}_${ind}`}
                  withRemoveButton
                  onRemove={() => setSnakeDel((s) => (s?.includes(tag) ? s.filter((i) => i !== tag) : s?.concat([tag])))}
                  styles={{
                    root: {
                      backgroundColor: snakeMarkDel?.includes(tag) ? "var(--mantine-color-error)" : "var(--mantine-color-dark-9)",
                    },
                  }}
                >
                  #{tag}
                </Pill>
              ))}
            </Flex>
          )}
        </Box>
        <TagsInput description="Можно выбрать или сразу создать и присвоить новый" label="Присвоить тэг" value={tags} onChange={setTags} onOptionSubmit={(v) => v.trim().replace(/s+/g, " ")} data={noAssigned} acceptValueOnBlur />
        <Box>
          <Text size="sm">Все созданные тэги</Text>
          <Space h="4px" />
          {isEmpty(profile?.snake_tags) ? (
            <Text size="xs">пусто</Text>
          ) : (
            <Flex gap="xs" wrap="wrap">
              {profile?.snake_tags?.map((pt) => (
                <Pill
                  key={pt}
                  withRemoveButton
                  onRemove={() => setProfileDel((s) => (s?.includes(pt) ? s.filter((i) => i !== pt) : s?.concat([pt])))}
                  styles={{
                    root: {
                      backgroundColor: profileMarkDel?.includes(pt) ? "var(--mantine-color-error)" : "var(--mantine-color-dark-9)",
                    },
                  }}
                >
                  #{pt}
                </Pill>
              ))}
            </Flex>
          )}
        </Box>
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={submit} loading={isPending || isUpdPend} disabled={!isDirty}>
          Подтвердить
        </Btn>
      </Stack>
    </Modal>
  );
};

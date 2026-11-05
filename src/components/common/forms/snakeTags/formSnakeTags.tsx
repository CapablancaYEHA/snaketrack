import { FC } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { Box, CheckIcon, ColorSwatch, Divider, Flex, Indicator, Modal, Pill, Popover, Space, Stack, TagsInput, Text } from "@mantine/core";
import { isEmpty, isEqual } from "lodash-es";
import { Btn } from "@/components/navs/btn/Btn";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import { ESupabase, IResSnakesList, IUpdReq } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { useProfile } from "@/api/profile/hooks";
import { IUpdProfileReq } from "@/api/profile/models";
import { notif } from "@/utils/notif";
import { SexName } from "../../sexName";
import { stickersSet } from "./const";

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
  const [swatch, setSwatch] = useState<string[] | undefined | null>([]);

  const isDirty = !isEmpty(profileMarkDel) || !isEmpty(snakeMarkDel) || !isEmpty(tags);
  const isStickerDirty = !isEqual(swatch, snake?.stickers ?? []);
  const noAssigned = (profile?.snake_tags ?? []).filter((ass) => !snake?.tags?.includes(ass));

  const clearSucc = () => {
    close();
    setTags(undefined);
    setSwatch(undefined);
    setSnakeDel([]);
    setProfileDel([]);
  };

  const submit = () => {
    if (isDirty) {
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
                  stickers: swatch,
                  last_action: "update",
                },
                id: snake?.id!,
              },
              {
                onSuccess: () => {
                  clearSucc();
                },
                onError: (err) => {
                  notif({ c: "red", m: err.message });
                },
              },
            );
          },
        },
      );
    } else {
      updSnake(
        {
          upd: {
            stickers: swatch,
            last_action: "update",
          },
          id: snake?.id!,
        },
        {
          onSuccess: () => {
            clearSucc();
          },
          onError: (err) => {
            notif({ c: "red", m: err.message });
          },
        },
      );
    }
  };

  useEffect(() => {
    setSwatch(snake?.stickers);
  }, [JSON.stringify(snake?.stickers)]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      transitionProps={{ transition: "fade", duration: 200 }}
      title={
        <Text size="md" fw={500}>
          Тэги. Создание, присвоение, удаление
        </Text>
      }
      keepMounted={false}
    >
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
        <TagsInput
          description="Можно выбрать или сразу создать и присвоить новый"
          label="Присвоить тэги"
          placeholder="Выбор или создание"
          value={tags}
          onChange={setTags}
          onOptionSubmit={(v) => v.trim().replace(/s+/g, " ")}
          data={noAssigned}
          acceptValueOnBlur
        />
        <Box>
          <Text size="sm">Все созданные тэги</Text>
          <Space h="4px" />
          {isEmpty(profile?.snake_tags) ? (
            <Text size="xs">никаких</Text>
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
        <Divider w="100%" maw="100%" mt="xs" />
        <Flex maw="100%" gap="0px" align="center">
          <Text size="md" fw={500}>
            Cтикеры
          </Text>
          <Popover width={300} position="top" withArrow shadow="md">
            <Popover.Target>
              <Indicator position="top-end" inline size={6} color="teal" processing offset={8} style={{ cursor: "pointer" }}>
                <IconSwitch icon="info" width="28" height="28" />
              </Indicator>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm">
                Полезно, если вы используете систему цветовых обозначений событий на садках. Например, синий — линька, черный — отказался от еды и т.д. Наносить цвета на контейнер можно стикерами или маркерами. Цветовые ассоциации вам нужно придумать для себя
                самостоятельно.
              </Text>
            </Popover.Dropdown>
          </Popover>
        </Flex>
        <Flex maw="100%" gap="xs">
          {stickersSet.map((col, i) => (
            <ColorSwatch
              key={`${col}_${i}`}
              size="22"
              component="button"
              color={col}
              onClick={() =>
                setSwatch((s) => {
                  if ((s ?? []).includes(col)) {
                    return (s ?? []).filter((el) => el !== col);
                  }
                  return [...(s ?? []), col];
                })
              }
              style={{ color: "white", cursor: "pointer" }}
            >
              {(swatch ?? []).indexOf(col) >= 0 ? <CheckIcon size={12} /> : null}
            </ColorSwatch>
          ))}
        </Flex>

        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={submit} loading={isPending || isUpdPend} disabled={(!isDirty && !isStickerDirty) || isPending || isUpdPend}>
          Подтвердить
        </Btn>
      </Stack>
    </Modal>
  );
};

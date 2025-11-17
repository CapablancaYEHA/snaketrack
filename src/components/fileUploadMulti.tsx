import { forwardRef, useEffect, useState } from "preact/compat";
import { AspectRatio, Box, Button, FileButton, Flex, Image, Stack, Text } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { IconSwitch } from "./navs/sidebar/icons/switch";
import css from "./styles.module.scss";

interface IProp {
  onUpload: (payload: File[] | null) => void;
  url: string[] | null;
  err?: string | null;
  clearFile: (a?: any) => void;
  clearAll: () => void;
}
export const FileUploadMulti = forwardRef<any, IProp>(({ onUpload, url, err, clearFile, clearAll }, ref) => {
  const [innerFiles, setInner] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isEmpty(url) && url && url?.length > 5) {
      setInner(url!.slice(0, 5));
    } else {
      setInner(url);
    }
  }, [url]);

  return (
    <>
      <Stack gap="sm" align="flex-start" justify="flex-start">
        <Stack style={{ cursor: "pointer" }}>
          <FileButton onChange={onUpload} accept="image/png,image/jpeg,image/jpg" resetRef={ref} multiple>
            {(props) => (
              <Stack align="flex-start" justify="flex-start" {...props} gap="xs">
                <Flex gap="xs" wrap="nowrap" align="center">
                  <Text fw="bold" size="sm">
                    Фото
                  </Text>
                  <Text fw={400} size="xs" style={{ whiteSpace: "nowrap" }}>
                    (максимум 5)
                  </Text>
                </Flex>
                <Box>
                  {isEmpty(innerFiles) ? (
                    <Flex gap="xs" align="center">
                      <IconSwitch icon="img" width="64" height="64" />
                      <IconSwitch icon="plus" width="24" height="24" />
                    </Flex>
                  ) : (
                    <Flex gap="sm" wrap="wrap">
                      {innerFiles?.map((u, ind) => (
                        <Box key={`${u?.slice(0, 4)}_${ind}`} pos="relative" style={{ maxHeight: 110 }}>
                          <AspectRatio ratio={16 / 9} maw={196}>
                            <Image src={u} width="100%" alt="uploaded_snake_pic" fit="cover" />
                          </AspectRatio>
                          <Box
                            pos="absolute"
                            top={4}
                            left={4}
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile(ind);
                            }}
                            className={css.circle}
                          >
                            <IconSwitch icon="bin" width="18" height="18" className={css.bin} />
                          </Box>
                        </Box>
                      ))}
                      {innerFiles && innerFiles?.length < 5 ? <IconSwitch icon="plus" width="24" height="24" /> : null}
                    </Flex>
                  )}
                </Box>
              </Stack>
            )}
          </FileButton>
          {err ? (
            <Text c="var(--mantine-color-error)" size="xs">
              {err}
            </Text>
          ) : null}
        </Stack>
        {!isEmpty(innerFiles) ? (
          <Button color="red" onClick={clearAll} size="compact-xs" mt={18}>
            Убрать все
          </Button>
        ) : null}
      </Stack>
    </>
  );
});

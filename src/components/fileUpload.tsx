import { forwardRef } from "preact/compat";
import { Button, FileButton, Space, Stack, Text } from "@mantine/core";
import { IconSwitch } from "./navs/sidebar/icons/switch";

interface IProp {
  onUpload: (payload: File | null) => void;
  url: string | null;
  err?: string | null;
  clearFile?: () => void;
}
export const FileUpload = forwardRef<any, IProp>(({ onUpload, url, err, clearFile }, ref) => {
  return (
    <>
      <Stack gap="sm" align="flex-start" justify="flex-start">
        <div style={{ cursor: "pointer" }}>
          <FileButton onChange={onUpload} accept="image/png,image/jpeg,image/jpg" resetRef={ref}>
            {(props) => (
              <Stack align="flex-start" justify="flex-start">
                <Text {...props} fw="bold" size="sm">
                  Фото
                  <span style={{ height: 109, display: "block" }}>
                    {url ? <img src={url} width={196} height={110} alt="uploaded_snake_pic" style={{ objectFit: "contain", objectPosition: "bottom left" }} /> : <IconSwitch icon="img" width="64" height="64" />}
                  </span>
                </Text>
              </Stack>
            )}
          </FileButton>
          {err ? (
            <>
              <Space h="sm" />
              <Text c="var(--mantine-color-error)" size="xs">
                {err}
              </Text>
            </>
          ) : null}
        </div>
        <div>
          {url ? (
            <Button color="red" onClick={clearFile} size="compact-xs" mt={18}>
              Убрать
            </Button>
          ) : null}
        </div>
      </Stack>
    </>
  );
});

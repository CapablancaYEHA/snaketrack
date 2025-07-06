import { useRef, useState } from "preact/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Flex, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Controller, useForm } from "react-hook-form";
import { FileUpload } from "@/components/fileUpload";
import { Btn } from "@/components/navs/btn/Btn";
import { httpReplacePic, httpUldSnPic } from "@/api/hooks";
import { calcImgUrl, compressImage } from "@/utils/supabaseImg";
import { filterSubmitByDirty, uplErr } from "../../common";
import { IClutchScheme, clutchSchema } from "./const";

export const FormEditClutch = ({ initData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    control,
  } = useForm<IClutchScheme>({
    defaultValues: initData,
    resolver: yupResolver(clutchSchema as any),
  });

  //   const [img, setImg] = useState<string | undefined>(initData.blob);

  const resetRef = useRef<() => void>(null);

  const onSub = async (sbm) => {
    let picture: string | null = null;
    if (sbm.picture != null) {
      if (initData.blob != null) {
        const { data: rep, error: er } = await httpReplacePic(initData.blob, sbm.picture);
        if (er) {
          uplErr(er);
          return;
        }
        picture = calcImgUrl(rep?.fullPath!);
      } else {
        const { data: upl, error: e } = await httpUldSnPic(sbm.picture);
        if (e) {
          uplErr(e);
          return;
        }
        picture = calcImgUrl(upl?.fullPath!);
      }
    }
    const submitBody = filterSubmitByDirty(sbm, dirtyFields);
  };

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Просмотр и редактирование кладки
      </Text>

      <Flex align="flex-start" maw="100%" w="100%">
        {/* <Controller
          name="picture"
          control={control}
          render={({ field: { onChange }, fieldState: { error } }) => {
            return (
              <FileUpload
                ref={resetRef}
                clearFile={() => {
                  setImg(undefined);
                  resetRef.current?.();
                  onChange(null);
                }}
                onUpload={async (a) => await compressImage(a!, onChange, setImg)}
                url={img || null}
                err={error?.message}
                withRemove={false}
              />
            );
          }}
        /> */}
        <Controller
          name="date_laid"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <DatePickerInput label="Дата кладки" value={value as any} onChange={onChange} valueFormat="DD MMMM YYYY" required highlightToday locale="ru" error={error?.message} maxDate={new Date()} />
              </>
            );
          }}
        />
        <Btn ml="auto" style={{ alignSelf: "flex-end" }} onClick={handleSubmit(onSub)} disabled={!isDirty}>
          Сохранить
        </Btn>
      </Flex>
    </>
  );
};

import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { useMakeBpClutchFromBreed } from "@/api/ballpythons/clutch";
import { IUpdBreedReq } from "@/api/ballpythons/models";
import { ESupabase } from "@/api/common";
import { useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { breedSchema, prepForUpdate } from "../common";
import { FormComposedBody } from "../subcomponents";

export const FormEditBpBreed = ({ initData }) => {
  const location = useLocation();
  const formInstance = useForm({
    defaultValues: initData,
    resolver: yupResolver(breedSchema),
  });

  const {
    formState: { dirtyFields },
  } = formInstance;

  const { mutate: update } = useSupaUpd<IUpdBreedReq>(ESupabase.BP_BREED, { qk: [ESupabase.BP_BREED_V], e: false });
  const { mutate } = useMakeBpClutchFromBreed();

  const onSub = (sub) => {
    update(prepForUpdate(sub, dirtyFields, location.query.id), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "План обновлен" });
        location.route("/breeding");
      },
      onError: async (err) => {
        notif({
          c: "red",
          t: "Ошибка",
          m: JSON.stringify(err),
          code: err.code || err.statusCode,
        });
      },
    });
  };

  const onFinalize = (sub) => {
    mutate(prepForUpdate(sub, dirtyFields, location.query.id), {
      onSuccess: (resp) => {
        notif({ c: "green", t: "Успешно", m: "План сохранен.\nКладка зарегистрирована" });
        location.route(`/clutches/edit/ball-pythons?id=${resp.id}`);
      },
      onError: async (err) => {
        notif({
          c: "red",
          t: "Ошибка",
          m: JSON.stringify(err),
          code: err.code || err.statusCode,
        });
      },
    });
  };

  return (
    <>
      <Title component="span" c="yellow.6" order={3}>
        Детализация бридинг плана
      </Title>
      <FormProvider {...formInstance}>
        <FormComposedBody onSub={onSub} onFinalize={onFinalize} btnText="Сохранить изменения" />
      </FormProvider>
    </>
  );
};

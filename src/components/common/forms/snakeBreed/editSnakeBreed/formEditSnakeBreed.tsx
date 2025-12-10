import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { IUpdBreedReq } from "@/api/breeding/models";
import { ESupaBreed, categoryToShort } from "@/api/common";
import { useMakeClutchFromBreed, useSupaUpd } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { breedSchema, prepForUpdate } from "../common";
import { FormComposedBody } from "../subcomponents";

export const FormEditSnakeBreed = ({ initData, category }) => {
  const location = useLocation();
  const formInstance = useForm({
    defaultValues: initData,
    resolver: yupResolver(breedSchema),
  });

  const {
    formState: { dirtyFields },
  } = formInstance;

  const cat = categoryToShort[category];

  const { mutate: update } = useSupaUpd<IUpdBreedReq>(ESupaBreed[`${cat.toUpperCase()}_BREED`], { qk: [ESupaBreed[`${cat.toUpperCase()}_BREED_V`]], e: false });
  const { mutate } = useMakeClutchFromBreed(category);

  const onSub = (sub) => {
    update(prepForUpdate(sub, dirtyFields, location.query.id), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "План проекта обновлен" });
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
        notif({ c: "green", t: "Успешно", m: "План проекта сохранен.\nКладка зарегистрирована" });
        location.route(`/clutches/edit/${category}?id=${resp.id}`);
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
        <FormComposedBody onSub={onSub} onFinalize={onFinalize} btnText="Сохранить изменения" category={category} existingClutchId={initData.clutch_id} />
      </FormProvider>
    </>
  );
};

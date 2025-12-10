import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { IReqCreateBreed } from "@/api/breeding/models";
import { ESupaBreed, categoryToShort } from "@/api/common";
import { useMakeClutchFromBreed, useSupaCreate } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { IBreedScheme, breedSchema, defaultVals, prepForCreate } from "../common";
import { FormComposedBody } from "../subcomponents";

export const FormAddBreed = ({ category }) => {
  const location = useLocation();
  const formInstance = useForm<IBreedScheme>({
    defaultValues: defaultVals,
    resolver: yupResolver(breedSchema),
  });

  const cat = categoryToShort[category];

  const { mutate: create } = useSupaCreate<IReqCreateBreed>(ESupaBreed[`${cat.toUpperCase()}_BREED`], { qk: [ESupaBreed[`${cat.toUpperCase()}_BREED_V`]], e: false });
  const { mutate } = useMakeClutchFromBreed(category);

  const onSub = (sub) => {
    create(prepForCreate(sub), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "План проекта сохранен" });
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
    mutate(prepForCreate(sub, "clutch"), {
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
        Планирование
      </Title>
      <FormProvider {...formInstance}>
        <FormComposedBody onSub={onSub} onFinalize={onFinalize} category={category} />
      </FormProvider>
    </>
  );
};

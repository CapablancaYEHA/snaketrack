import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { useMakeBpClutchFromBreed } from "@/api/ballpythons/clutch";
import { IReqCreateBPBreed } from "@/api/ballpythons/models";
import { ESupabase } from "@/api/common";
import { useSupaCreate } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { IBreedScheme, breedSchema, defaultVals, prepForCreate } from "../common";
import { FormComposedBody } from "../subcomponents";

export const FormAddBbBreed = () => {
  const location = useLocation();
  const formInstance = useForm<IBreedScheme>({
    defaultValues: defaultVals,
    resolver: yupResolver(breedSchema),
  });

  const { mutate: create } = useSupaCreate<IReqCreateBPBreed>(ESupabase.BP_BREED, { qk: [ESupabase.BP_BREED_V], e: false });
  const { mutate } = useMakeBpClutchFromBreed();

  const onSub = (sub) => {
    create(prepForCreate(sub), {
      onSuccess: () => {
        notif({ c: "green", t: "Успешно", m: "План сохранен" });
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
        Планирование
      </Title>
      <FormProvider {...formInstance}>
        <FormComposedBody onSub={onSub} onFinalize={onFinalize} />
      </FormProvider>
    </>
  );
};

import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateBpBreed, useMakeClutchFromBreed } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { IBreedScheme, breedSchema, defaultVals, prepForCreate } from "../common";
import { FormComposedBody } from "../subcomponents";

export const FormAddBbBreed = ({ owned_bp_list }) => {
  const location = useLocation();
  const formInstance = useForm<IBreedScheme>({
    defaultValues: defaultVals,
    resolver: yupResolver(breedSchema),
  });

  const { mutate: create } = useCreateBpBreed();
  const { mutate } = useMakeClutchFromBreed();

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
        location.route(`/clutches/edit?id=${resp.id}`);
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
        <FormComposedBody owned_bp_list={owned_bp_list} onSub={onSub} onFinalize={onFinalize} />
      </FormProvider>
    </>
  );
};

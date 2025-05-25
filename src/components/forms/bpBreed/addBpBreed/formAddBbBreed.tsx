import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateBpBreed } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { breedSchema, defaultVals, prepForCreate } from "../common";
import { FormComposedBody } from "../subcomponents";

export const FormAddBbBreed = ({ owned_bp_list }) => {
  const location = useLocation();
  const formInstance = useForm({
    defaultValues: defaultVals,
    resolver: yupResolver(breedSchema),
  });

  const { mutate } = useCreateBpBreed();

  const onSub = (sub) => {
    mutate(prepForCreate(sub), {
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

  return (
    <>
      <Title component="span" c="yellow.6" order={3}>
        Планирование
      </Title>
      <FormProvider {...formInstance}>
        <FormComposedBody owned_bp_list={owned_bp_list} onSub={onSub} />
      </FormProvider>
    </>
  );
};

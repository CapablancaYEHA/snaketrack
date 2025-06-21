import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { useUpdateBpBreed } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { FormComposedBody } from "../../bpBreed/subcomponents";
import { breedSchema, prepForUpdate } from "../common";

export const FormEditBpBreed = ({ initData, owned_bp_list }) => {
  const location = useLocation();
  const formInstance = useForm({
    defaultValues: initData,
    resolver: yupResolver(breedSchema),
  });

  const { mutate } = useUpdateBpBreed();

  const onSub = (sub) => {
    mutate(prepForUpdate(sub, formInstance.formState.dirtyFields, location.query.id), {
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

  return (
    <>
      <Title component="span" c="yellow.6" order={3}>
        Детализация бридинг плана
      </Title>
      <FormProvider {...formInstance}>
        <FormComposedBody owned_bp_list={owned_bp_list} onSub={onSub} btnText="Сохранить изменения" />
      </FormProvider>
    </>
  );
};

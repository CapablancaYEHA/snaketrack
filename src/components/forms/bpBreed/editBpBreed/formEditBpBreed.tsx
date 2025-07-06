import { useLocation } from "preact-iso";
import { yupResolver } from "@hookform/resolvers/yup";
import { Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { useMakeClutchFromBreed, useUpdateBpBreed } from "@/api/hooks";
import { notif } from "@/utils/notif";
import { FormComposedBody } from "../../bpBreed/subcomponents";
import { breedSchema, prepForUpdate } from "../common";

export const FormEditBpBreed = ({ initData, owned_bp_list }) => {
  const location = useLocation();
  const formInstance = useForm({
    defaultValues: initData,
    resolver: yupResolver(breedSchema),
  });

  const {
    formState: { dirtyFields },
  } = formInstance;

  const { mutate: update } = useUpdateBpBreed();
  const { mutate } = useMakeClutchFromBreed();

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
        Детализация бридинг плана
      </Title>
      <FormProvider {...formInstance}>
        <FormComposedBody owned_bp_list={owned_bp_list} onSub={onSub} onFinalize={onFinalize} btnText="Сохранить изменения" />
      </FormProvider>
    </>
  );
};
function makeClutchFromBpBreed(): { mutate: any } {
  throw new Error("Function not implemented.");
}

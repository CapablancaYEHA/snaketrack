import { Button, Loader, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useVkMarket } from "@/api/misc/hooks";

export const FormImportVk = () => {
  const { mutate, isPending } = useVkMarket();
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {} as any,
    resolver: {} as any,
  });

  return (
    <div>
      <TextInput {...register("group_name")} required label="Название группы" error={errors?.snake_name?.message} flex="1 1 50%" />
      <Button size="compact-xs" variant="default" onClick={() => mutate(getValues("group_name"))}>
        пук
      </Button>
      {isPending ? <Loader color="dark.1" size="sm" d="block" w="100%" /> : null}
    </div>
  );
};

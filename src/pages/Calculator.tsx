import { yupResolver } from "@hookform/resolvers/yup";
import { SegmentedControl, Stack, Title } from "@mantine/core";
import { signal } from "@preact/signals";
import { FormProvider, useForm } from "react-hook-form";
import { OddsCalc } from "@/components/common/genetics/OddsCalc";
import { ECategories } from "@/api/common";

const vis = localStorage.getItem("CALCS_VISITED") as ECategories;

const sigCurCat = signal<ECategories>(vis ?? ECategories.BP);

export function Calculator() {
  const formInstance = useForm({
    defaultValues: { parentOne: [], parentTwo: [] },
    resolver: yupResolver({} as any),
  });

  const handle = (a) => {
    sigCurCat.value = a;
    localStorage.setItem("CALCS_VISITED", a);
    formInstance.resetField("parentOne");
    formInstance.resetField("parentTwo");
  };

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Title component="span" order={4} c="yellow.6">
        Калькулятор
      </Title>
      <SegmentedControl
        style={{ alignSelf: "center" }}
        value={sigCurCat.value as any}
        onChange={handle}
        w="100%"
        maw="252px"
        size="xs"
        data={[
          {
            label: "Региусы",
            value: ECategories.BP,
          },
          {
            label: "Удавы",
            value: ECategories.BC,
          },
          {
            label: "Маисы",
            value: ECategories.CS,
          },
        ]}
      />
      <FormProvider {...formInstance}>
        <OddsCalc category={sigCurCat.value} />
      </FormProvider>
    </Stack>
  );
}

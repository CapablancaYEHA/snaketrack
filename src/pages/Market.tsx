import { useEffect, useState } from "preact/hooks";
import { Autocomplete, Stack, Title } from "@mantine/core";
import { debounce } from "lodash-es";
import { useDadata } from "@/api/hooks";

export function Market() {
  const [val, setVal] = useState("");
  const { mutate, data, isPending, isError } = useDadata();

  const debSearch = debounce(setVal, 400);
  const opts = (data ?? [])?.map((a) => ({ label: a.value, value: a.value }));

  useEffect(() => {
    if (val) {
      mutate(val);
    }
  }, [val, mutate]);

  return (
    <Stack align="flex-start" justify="flex-start" gap="md" component="section">
      <Title component="span" order={4} c="yellow.6">
        Подробная информация о змее
      </Title>
      <Autocomplete data={opts} limit={5} maxDropdownHeight={200} onChange={debSearch} value={val} />
    </Stack>
  );
}

import { useRef } from "preact/hooks";
import { Combobox, Loader, Stack, Text, TextInput, useCombobox } from "@mantine/core";
import { isEmpty } from "lodash-es";

export const Autocomp = ({ data, onChange, value, onOptionSubmit, required = false, isPending = false }) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const opts = data?.map((item) => {
    const res = `${item.data.city}${item.data.region.includes(item.data.city) ? "" : `, ${item.data.region_with_type}`}`;
    return (
      <Combobox.Option value={{ city_name: res, city_code: item.data.city_kladr_id } as any} key={res}>
        <Stack gap="sm">
          <Text size="xs">{res}</Text>
        </Stack>
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      onOptionSubmit={(opt: any) => {
        onOptionSubmit(opt);
        onChange(opt.city_name);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          ref={ref}
          required={required}
          label="Город"
          placeholder=""
          value={value}
          onChange={(event) => {
            onChange(event.currentTarget.value);
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => {
            combobox.openDropdown();
            ref.current?.select?.();
          }}
          onFocus={() => undefined}
          onBlur={() => combobox.closeDropdown()}
          rightSection={isPending && <Loader size={18} />}
        />
      </Combobox.Target>
      <Combobox.Dropdown mah={180} style={{ overflowY: "auto" }} hidden={isPending || data === null}>
        <Combobox.Options>
          {value.trim().length === 0 ? <Combobox.Empty>Начните печатать</Combobox.Empty> : opts}
          {value.trim().length > 0 && isEmpty(opts) ? <Combobox.Empty>Нет совпадений</Combobox.Empty> : null}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

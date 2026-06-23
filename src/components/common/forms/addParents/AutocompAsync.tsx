import { useRef } from "preact/hooks";
import { Combobox, Flex, Loader, Text, TextInput, useCombobox } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { getAge } from "@/utils/time";

export const AutocompAsync = ({ data, onChange, value, onOptionSubmit, required = false, isPending = false, error }) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const opts = data?.map((item) => {
    return (
      <Combobox.Option value={{ snake_name: item.snake_name, id: item.id } as any} key={item.id}>
        <Flex justify="space-between" align="center" maw="100%" w="100%">
          <Text size="sm" fw={500}>
            {item.sex === "male" ? "♂️" : "♀️"} {item.snake_name}
          </Text>
          <Text size="xs">возраст {getAge(item.date_hatch)}</Text>
        </Flex>
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      onOptionSubmit={(opt: any) => {
        onOptionSubmit(opt);
        onChange(`${opt.id}_${opt.snake_name}`);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          ref={ref}
          required={required}
          label="Глобальный поиск"
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
          error={error}
        />
      </Combobox.Target>
      <Combobox.Dropdown mah={180} style={{ overflowY: "auto" }} hidden={isPending || data === null}>
        <Combobox.Options>
          {value?.trim()?.length === 0 ? <Combobox.Empty>Начните печатать</Combobox.Empty> : opts}
          {value?.trim()?.length > 0 && isEmpty(opts) ? <Combobox.Empty>Нет совпадений</Combobox.Empty> : null}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

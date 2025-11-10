import { useEffect, useState } from "preact/hooks";
import { CheckIcon, Combobox, Group, MantineStyleProps, Pill, PillsInput, useCombobox } from "@mantine/core";
import { debounce, isEmpty } from "lodash-es";

type IDt = {
  label: string;
  value: string;
};
const MAX_DISPLAYED_VALUES = 1;
interface IProp {
  label: string;
  data: (IDt | string)[];
  onChange: (v: string[]) => void;
  dataHasLabel?: boolean;
  [key: string]: any;
  flex?: MantineStyleProps["flex"];
  initVal?: any[];
}

export function MaxSelectedMulti({ data, label, onChange, dataHasLabel, flex, initVal, ...rest }: IProp) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");
  const debSearch = debounce(setSearch, 400);
  const [value, setValue] = useState<any[]>([]);

  const handleValueSelect = (val: string) => {
    setValue((current) => {
      let res;
      if (current.includes(val)) {
        res = current.filter((v) => v !== val);
        onChange?.(res);
        return res;
      }
      res = [...current, val];
      onChange?.(res);
      return res;
    });
    setSearch("");
  };

  const handleValueRemove = (val: any) => {
    setValue((current) => {
      const isObj = typeof current[0] === "object";
      const trg = isObj ? current.map((c) => c.value) : current;
      let res = trg.filter((v) => v !== (isObj ? val.value : val));
      onChange?.(res);
      return res;
    });
  };

  const values = value.slice(0, MAX_DISPLAYED_VALUES).map((item: any) => {
    return (
      <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
        {dataHasLabel ? (data as any).find((f) => (f as any).value === item)?.label : item}
      </Pill>
    );
  });

  const options = data
    .filter((a) => {
      const str = search.trim().toLowerCase();
      if (typeof a === "object") {
        return a.label.toLowerCase().includes(str);
      }
      return a.toLowerCase().includes(str);
    })
    .map((item) => {
      const isObj = typeof item === "object";
      return (
        <Combobox.Option value={isObj ? item.value : item} key={isObj ? item.value : item} active={value.includes(isObj ? item.value : item)}>
          <Group gap="sm">
            {value.includes(isObj ? item.value : item) ? <CheckIcon size={12} /> : null}
            <span>{isObj ? item.label : item}</span>
          </Group>
        </Combobox.Option>
      );
    });

  useEffect(() => {
    if (isEmpty(initVal)) setValue([]);
    else setValue(initVal as any);
  }, [initVal]);

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false} position="bottom">
      <Combobox.DropdownTarget>
        <PillsInput pointer onClick={() => combobox.openDropdown()} label={label} miw={150} flex={flex}>
          <Pill.Group>
            {value.length > 0 ? (
              <>
                {values}
                {value.length > MAX_DISPLAYED_VALUES && <Pill>+ ещё {value.length - MAX_DISPLAYED_VALUES}</Pill>}
              </>
            ) : null}

            <Combobox.EventsTarget {...rest}>
              <PillsInput.Field
                onBlur={() => combobox.closeDropdown()}
                onFocus={() => combobox.openDropdown()}
                placeholder={(value.length > 0 && undefined) || "Мультивыбор"}
                value={search}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  debSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown mah={212} style={{ overflowY: "auto" }}>
        <Combobox.Options>{options.length > 0 ? options : <Combobox.Empty>Нет совпадений</Combobox.Empty>}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

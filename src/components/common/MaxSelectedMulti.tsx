import { useState } from "preact/hooks";
import { CheckIcon, Combobox, Group, Input, Pill, PillsInput, useCombobox } from "@mantine/core";

const MAX_DISPLAYED_VALUES = 1;
interface IProp {
  label: string;
  data: any[];
  onChange: (v: string[]) => void;
}
export function MaxSelectedMulti({ data, label, onChange }: IProp) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [value, setValue] = useState<string[]>([]);

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
  };

  const handleValueRemove = (val: string) => {
    setValue((current) => {
      let res = current.filter((v) => v !== val);
      onChange?.(res);
      return res;
    });
  };

  const values = value.slice(0, MAX_DISPLAYED_VALUES).map((item: any) => {
    const isObj = typeof item === "object";
    return (
      <Pill key={isObj ? item.value : item} withRemoveButton onRemove={() => handleValueRemove(isObj ? item.value : item)}>
        {isObj ? item.label : item}
      </Pill>
    );
  });

  const options = data.map((item) => {
    const isObj = typeof item === "object";
    return (
      <Combobox.Option value={item} key={isObj ? item.value : item} active={value.includes(isObj ? item.value : item)}>
        <Group gap="sm">
          {value.includes(isObj ? item.value : item) ? <CheckIcon size={12} /> : null}
          <span>{isObj ? item.label : item}</span>
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput pointer onClick={() => combobox.toggleDropdown()} label={label} miw={150}>
          <Pill.Group>
            {value.length > 0 ? (
              <>
                {values}
                {value.length > MAX_DISPLAYED_VALUES && <Pill>+ ещё {value.length - MAX_DISPLAYED_VALUES}</Pill>}
              </>
            ) : (
              <Input.Placeholder>Мультивыбор</Input.Placeholder>
            )}

            <Combobox.EventsTarget>
              <PillsInput.Field
                type="hidden"
                onBlur={() => combobox.closeDropdown()}
                onKeyDown={(event) => {
                  if (event.key === "Backspace") {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

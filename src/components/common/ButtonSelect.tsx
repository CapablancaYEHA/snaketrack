import { Button, CheckIcon, Combobox, Group, useCombobox } from "@mantine/core";
import { FC, useState } from "react";

export const ButtonSelect: FC<any> = ({ options, handleSelect, label }) => {
  const [selected, setSelectedItem] = useState<string | null>(null);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const opt = options.map((item) => (
    <Combobox.Option value={item.value} key={item.value} active={item.value === selected}>
      <Group gap="sm">
        {item.value === selected ? <CheckIcon size={12} /> : null}
        <span>{item.label}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      width={250}
      position="bottom-start"
      withArrow
      withinPortal={false}
      onOptionSubmit={(val) => {
        setSelectedItem(val);
        combobox.closeDropdown();
        handleSelect?.(val);
      }}
      size="xs"
    >
      <Combobox.Target>
        <Button size="compact-sm" onClick={() => combobox.toggleDropdown()}>
          {label}
        </Button>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>{opt}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

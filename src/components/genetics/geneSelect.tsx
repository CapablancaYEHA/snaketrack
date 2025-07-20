import { FC } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { CheckIcon, Combobox, Group, MantineSize, Pill, PillsInput, useCombobox } from "@mantine/core";
import { debounce } from "lodash-es";
import { IGenesBpComp } from "@/api/models";
import { checkGeneConflict, geneToColor, redef, upgradeOptions } from "./const";
import styles from "./styles.module.scss";

type IPill = {
  onRemove?: (a) => void;
  item: IGenesBpComp;
  size?: MantineSize;
};
export const GenePill: FC<IPill> = ({ item, onRemove, size = "sm" }) => {
  const isHet = item.label.toLowerCase().includes("het");
  return (
    <Pill
      styles={{
        root: { ...redef, backgroundColor: isHet ? "var(--mantine-color-dark-9)" : geneToColor[item.gene], boxShadow: `0 0 0 1px ${geneToColor[item.gene]}` },
      }}
      key={item.label}
      withRemoveButton={onRemove != null}
      onRemove={onRemove ? () => onRemove(item) : () => undefined}
      size={size}
    >
      {item.label}
    </Pill>
  );
};

interface IProp {
  outer?: IGenesBpComp[];
  onChange: (a) => void;
  init?: IGenesBpComp[];
  label?: string;
  placeholder?: string;
}

export const GeneSelect: FC<IProp> = ({ outer, onChange, init, label, placeholder = "Normal, no Het" }) => {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex("active");
    },
  });

  const [search, setSearch] = useState("");
  const debSearch = debounce(setSearch, 400);
  const [value, setValue] = useState<IGenesBpComp[]>([]);

  const handleValueSelect = (val: IGenesBpComp) => setValue((current) => (current.some((a) => a.label === val.label) ? current.filter((v) => v.label !== val.label) : checkGeneConflict(current, val)));

  const handleValueRemove = (val: IGenesBpComp) => setValue((current) => current.filter((v) => v.label !== val.label));

  const values = value.map((item) => <GenePill item={item} key={`${item.label}_${item.id}`} onRemove={handleValueRemove} />);

  const options = upgradeOptions(outer ?? [], search).map((item) => (
    <Combobox.Option value={item as any} key={item.label} active={value.includes(item)}>
      <Group gap="sm">
        {value.some((a) => a.label === item.label) ? <CheckIcon size={12} /> : null}
        <span>{item.label}</span>
      </Group>
    </Combobox.Option>
  ));

  useEffect(() => {
    if (init) setValue(init);
  }, []);

  useEffect(() => {
    onChange(value);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.length]);

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect as any} withinPortal={false} disabled={outer?.length === 0}>
      <Combobox.DropdownTarget>
        <PillsInput onClick={() => combobox.openDropdown()} label={label}>
          <Pill.Group>
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={value.length ? undefined : placeholder}
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
                pointer
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown mah={160} style={{ overflowY: "auto" }} className={styles.scrollbox}>
        <Combobox.Options>{search.trim().length === 0 ? <Combobox.Empty>Начните печатать</Combobox.Empty> : options.length > 0 ? options : <Combobox.Empty>Нет совпадений</Combobox.Empty>}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

import { FC } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { CheckIcon, Combobox, Group, MantineSize, Pill, PillsInput, Text, useCombobox } from "@mantine/core";
import { debounce } from "lodash-es";
import { ECategories, IGenesComp } from "@/api/common";
import { useSnakeGenes } from "@/api/hooks";
import { checkGeneConflict, geneToColor, redef, upgradeOptions } from "./const";
import styles from "./styles.module.scss";
import { useLongPress } from "./useLongPress";

type IPill = {
  onRemove?: (a) => void;
  item: IGenesComp;
  size?: MantineSize;
  onLeftClick?: (a: IGenesComp) => void;
  withWrap?: boolean;
};
export const GenePill: FC<IPill> = ({ item, onRemove, size = "sm", onLeftClick, withWrap }) => {
  const isHet = (item.gene === "rec" || (item.gene === "inc-dom" && item.hasHet)) && item.label.toLowerCase().includes("het");
  const isPercent = item.label.startsWith("50%") || item.label.startsWith("66%");

  const handlers = useLongPress(() => onLeftClick?.(item));

  return (
    <Pill
      styles={{
        root: {
          ...redef,
          backgroundColor: isHet ? "var(--mantine-color-dark-9)" : geneToColor[item.gene],
          boxShadow: `0 0 0 1px ${geneToColor[item.gene]}`,
          cursor: "default",
          ...(item.isPos ? { paddingLeft: "24px" } : {}),
          ...(withWrap ? { whiteSpace: "normal", height: "auto", flex: "1" } : {}),
        },
      }}
      key={item.label}
      withRemoveButton={onRemove != null}
      onRemove={onRemove ? () => onRemove(item) : () => undefined}
      size={size}
      {...(isPercent ? {} : handlers)}
    >
      {item.isPos ? (
        <div className={styles.possible}>
          <Text className={styles.circle} size="0.6rem" fw={500}>
            P
          </Text>
        </div>
      ) : null}
      {item.label}
    </Pill>
  );
};

interface IProp {
  onChange: (a) => void;
  init?: IGenesComp[];
  label?: string;
  placeholder?: string;
  description?: string;
  category: ECategories;
}

export const GenesSelect: FC<IProp> = ({ onChange, init, label, category, placeholder = "Normal, no Het", description = "Нажмите и удерживайте выбраный ген, чтобы пометить его как Possible" }) => {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex("active");
    },
  });

  const { data: traits } = useSnakeGenes(category);
  const [search, setSearch] = useState("");
  const debSearch = debounce(setSearch, 400);
  const [value, setValue] = useState<IGenesComp[]>([]);

  const handleValueSelect = (val: IGenesComp) => setValue((current) => (current.some((a) => a.label === val.label) ? current.filter((v) => v.label !== val.label) : checkGeneConflict(current, val)));

  const handleValueRemove = (val: IGenesComp) => setValue((current) => current.filter((v) => v.label !== val.label));

  const handleAssignPos = (val: IGenesComp) =>
    setValue((current) => {
      const ind = current.findIndex((a) => a.id === val.id);
      const trg = { ...current[ind] };
      let res = { ...trg, isPos: !trg.isPos };
      let temp = [...current];
      temp[ind] = res;
      return temp;
    });

  const values = value.map((item) => <GenePill item={item} key={`${item.label}_${item.id}`} onRemove={handleValueRemove} onLeftClick={handleAssignPos} />);

  const options = upgradeOptions(traits ?? [], search).map((item) => (
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
  }, [value]);

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect as any} withinPortal={false} disabled={traits?.length === 0}>
      <Combobox.DropdownTarget>
        <PillsInput w="100%" miw={170} onClick={() => combobox.openDropdown()} label={label} description={description}>
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

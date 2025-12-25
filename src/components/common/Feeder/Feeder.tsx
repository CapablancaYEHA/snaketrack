import { FC } from "preact/compat";
import { useState } from "preact/hooks";
import { Flex, Select, StyleProp } from "@mantine/core";
import { assembleFeeder, feederAge, feederCond, feederType } from "./const";

interface IProp {
  errMsg;
  onChange: Function;
  flex?: StyleProp<string | number | null>;
}
export const Feeder: FC<IProp> = ({ errMsg, onChange, flex }) => {
  const [feeder, setFeeder] = useState({ cond: null, type: null, age: null });

  const handle = (val, id) =>
    setFeeder((s) => {
      const a = { ...s, [id]: val };
      onChange(assembleFeeder(a));
      return a;
    });

  return (
    <Flex gap="lg" wrap="wrap" flex={flex} direction="row">
      <Select flex="1 0 136px" data={feederCond} value={feeder.cond} onChange={(a) => handle(a, "cond")} label="❄️/☀️" placeholder="Опционально" data-scroll-locked={0} allowDeselect />
      <Select flex="1 0 136px" data={feederType} value={feeder.type} onChange={(a) => handle(a, "type")} label="Тип КО" error={errMsg} placeholder="Не выбрано" allowDeselect data-scroll-locked={0} />
      <Select flex="1 0 136px" data={feederAge} value={feeder.age} onChange={(a) => handle(a, "age")} label="Размер" placeholder="Опционально" allowDeselect data-scroll-locked={0} />
    </Flex>
  );
};

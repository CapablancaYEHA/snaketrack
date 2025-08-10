import { useState } from "preact/hooks";
import { Flex, Select } from "@mantine/core";
import { assembleFeeder, feederAge, feederCond, feederType } from "./const";

export const Feeder = ({ errMsg, onChange }) => {
  const [feeder, setFeeder] = useState({ cond: null, type: null, age: null });

  const handle = (val, id) =>
    setFeeder((s) => {
      const a = { ...s, [id]: val };
      onChange(assembleFeeder(a));
      return a;
    });

  return (
    <Flex gap="lg" wrap="wrap">
      <Select flex="1 0 136px" data={feederCond} value={feeder.cond} onChange={(a) => handle(a, "cond")} label="❄️/☀️" placeholder="Опционально" data-scroll-locked={0} />
      <Select flex="1 0 136px" data={feederType} value={feeder.type} onChange={(a) => handle(a, "type")} label="Кормовой объект" error={errMsg} placeholder="Не выбрано" searchable allowDeselect data-scroll-locked={0} />
      <Select flex="1 0 136px" data={feederAge} value={feeder.age} onChange={(a) => handle(a, "age")} label="Размер" placeholder="Опционально" searchable allowDeselect data-scroll-locked={0} />
    </Flex>
  );
};

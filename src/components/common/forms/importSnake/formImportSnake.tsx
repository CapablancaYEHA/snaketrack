import { useLocation } from "preact-iso";
import { FC } from "preact/compat";
import { useState } from "preact/hooks";
import { Button, FileButton, Flex, Highlight, List, Mark, Space, Stack, Text } from "@mantine/core";
import { isEmpty } from "lodash-es";
import { ECategories, ESupabase, IReqCreateSnake } from "@/api/common";
import { useSupaCreate } from "@/api/hooks";
import { getAge } from "@/utils/time";
import { SexName } from "../../sexName";
import { IParsedRocket } from "./types";
import { createSnakes, handleJson, handlePost } from "./utils";

interface IProps {
  table: ESupabase;
  title: string;
  category: ECategories;
}

export const FormImportSnake: FC<IProps> = ({ table, title, category }) => {
  const location = useLocation();
  const [file, setFile] = useState<IParsedRocket | null>(null);
  const { mutate, isPending } = useSupaCreate<IReqCreateSnake[]>(table, undefined, true);

  let sneks = file !== null ? createSnakes(file, category) : null;

  return (
    <>
      <Text size="md" fw={500} c="yellow.6">
        Импорт {title}ов
      </Text>
      <Text size="sm">
        <Mark color="yellow">Примечание</Mark> Произойдёт обработка выбранной категории змей. Для каждой конкретной категории вам надо находиться на соответствующей странице
      </Text>
      <Text size="sm">Для импорта из ReptileRocket нужно:</Text>
      <List type="ordered" size="sm">
        <List.Item>
          Изменить названия ваших категорий животных на следующие (в латинской раскладке):
          <Highlight highlight={["bps", "bcs", "corns"]} highlightStyles={{ padding: "0 4px 0 4px" }} inline size="sm">
            для Региусов — указать bps, для Удавов — bcs, для Маисов — corns
          </Highlight>
        </List.Item>
        <List.Item>Сделать Резервную копию ваших данных, приложение укажет в какой папке был сохранен .zip архив</List.Item>
        <List.Item>Найти архив, распаковать и загрузить .json файл на эту страницу через кнопку</List.Item>
      </List>

      <Text size="sm">
        <Mark color="red">Примечание</Mark> Перенос включает данные о линьках и кормлениях. А вот с морфами проблема — в связи с вольной текстовой формой ввода, не получится 100% корректно их распознать, поэтому данная информация будет находиться в поле "Ваше
        примечание" на итоговой странице змеи, и вам нужно будет самостоятельно внести морфы через редактирование
      </Text>
      <FileButton onChange={(a: any) => handleJson(a, setFile)} accept="application/json">
        {(props) => (
          <Button {...props} size="compact-xs" variant="default">
            Выбрать json
          </Button>
        )}
      </FileButton>
      <Space h="xs" />
      {sneks == null ? null : isEmpty(sneks) ? (
        <Text fw={500} c="var(--mantine-color-error)">
          Обработка JSON не показала змей для импорта
        </Text>
      ) : (
        <>
          <Text>{title}ы, которые будут добавлены в коллекцию</Text>
          <Flex gap="md" wrap="wrap" maw="100%" w="100%">
            {sneks.map((s, ind, self) => (
              <Stack gap="xs" key={`${s.date_hatch}_${s.snake_name}`} flex="0 1 110px" pos="relative">
                <SexName sex={s?.sex} name={s?.snake_name} size="xs" />
                <Text size="xs">⌛ {getAge(s?.date_hatch)}</Text>
                <Text size="xs">{s.notes}</Text>
                {/* <Box pos="absolute" bottom={4} right={4} onClick={() => (sneks = self.filter((_, i) => i !== ind))} className={css.circle}>
                  <IconSwitch icon="bin" width="18" height="18" className={css.bin} />
                </Box> */}
              </Stack>
            ))}
          </Flex>
          <Space h="sm" />
          <Button size="xs" onClick={() => handlePost(mutate, sneks, location.route)} loading={isPending} disabled={isPending}>
            Подтвердить
          </Button>
        </>
      )}
    </>
  );
};

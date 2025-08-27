import { notifications } from "@mantine/notifications";

interface IProp {
  c?: "red" | "green";
  m?: string;
  t?: string | null;
  close?: number;
  code?: string;
}

export const notif = ({ c = "green", m = "Что-то пошло не так", t, close = 5000, code }: IProp) =>
  notifications.show({
    title: t,
    message: code && codeToMsg[code] != null ? codeToMsg[code] : m,
    color: c,
    autoClose: close,
    withBorder: true,
  });

const codeToMsg = {
  email_not_confirmed: "E-mail не подтвержден",
  invalid_credentials: "Неверный данные для логина",
  23505: "Данное имя пользователя уже занято",
  23503: "Нельзя удалить змею, т.к. она участвует в кладках или планах",
  409: "Фото с таким именем уже существует",
  42501: "Недостаточно прав",
  PGRST116: "Такой змеи не существует",
};

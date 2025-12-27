import { notifications } from "@mantine/notifications";

interface IProp {
  c?: "red" | "green" | "teal" | "orange" | "cyan";
  m?: string;
  t?: string | null;
  p?: string;
  close?: number;
  code?: string;
}

export const notif = ({ c = "green", m = "Что-то пошло не так", t, close = 5000, code, p }: IProp) =>
  notifications.show({
    title: t,
    message: code && codeToMsg[code] != null ? codeToMsg[code] : m,
    color: c,
    autoClose: close,
    withBorder: true,
    position: p as any,
  });

const codeToMsg = {
  email_not_confirmed: "E-mail не подтвержден",
  invalid_credentials: "Неверный данные для логина",
  23505: "Данное имя пользователя уже занято",
  409: "Фото с таким именем уже существует",
  42501: "Недостаточно прав",
};

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { declWord } from "./other";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);

export const getDate = (a: string) => dayjs(a).locale("ru").format("D MMMM YYYY");
export const getDateHours = (a: string) => dayjs(a).locale("ru").format("D MMMM YYYY HH:mm:ss");

export const dateToSupabaseTime = (a: any): string => dayjs(a).format("YYYY-MM-DD HH:mm:ss.SSSZZ");

export const getAge = (a: string) => {
  const years = dayjs().diff(dayjs(a), "year");
  const months = dayjs().diff(dayjs(a), "month") - years * 12;
  const days = dayjs().diff(dayjs(a).add(years, "year").add(months, "month"), "day");

  return `${years ? `${declWord(years, ["год", "года", "лет"])}` : ""}
  ${months ? `${declWord(months, ["месяц", "месяца", "месяцев"])}` : ""}
  ${days ? `${declWord(days, ["день", "дня", "дней"])}` : ""}`;
};

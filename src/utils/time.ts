import dayjs, { Dayjs, OpUnitType, QUnitType } from "dayjs";
import "dayjs/locale/ru";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { declWord } from "./other";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(advancedFormat);

export function adapterLocale() {
  dayjs.locale("ru");
}

export const getDate = (a: Date | string | Dayjs) => dayjs(a).locale("ru").format("D MMMM YYYY");
export const getDateCustom = (a: string | Dayjs, pattern = "YYYY-MM-DD") => dayjs(a).locale("ru").format(pattern);
export const getDateObj = (a: string | Dayjs) => dayjs(a).locale("ru").valueOf();
export const getDateOfMonth = (a: string | Dayjs | Date) => dayjs(a).locale("ru").date();
export const getIsSame = (a: any, b: any, time: OpUnitType = "day") => dayjs(a).locale("ru").isSame(b, time);

export const getDateShort = (a: string) => dayjs(a).locale("ru").format("D.MM.YY");
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

export const dateTimeDiff = (trg: string | Dayjs, unit: QUnitType) => {
  const res = dayjs(trg).diff(dayjs(), unit);
  return res <= 0 ? 0 : res;
};

export const dateAddDays = (a: string | Dayjs, days: number) => dayjs(a).add(days, "day");

export const isOlderThan = (birthDate: string | Dayjs, targetAge: number) => {
  return dayjs().diff(dayjs(birthDate), "month") > targetAge;
};
export const isYoungerThan = (birthDate: string | Dayjs, targetAge: number) => {
  return dayjs().diff(dayjs(birthDate), "month") < targetAge;
};

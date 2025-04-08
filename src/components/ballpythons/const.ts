import { getDateShort } from "@/utils/time";
import { feederToString } from "../forms/addBp/const";

export const bpColumns = [
  {
    accessor: "feed_last_at",
    title: "Дата",
    render: ({ feed_last_at }) => getDateShort(feed_last_at),
    sortable: true,
    noWrap: true,
    width: 100,
  },
  {
    accessor: "feed_ko",
    title: "КО",
    render: ({ feed_ko }) => feederToString[feed_ko],
    sortable: true,
    width: 160,
  },
  {
    accessor: "feed_weight",
    title: "Вес КО",
    sortable: true,
    noWrap: true,
    width: 80,
  },
  {
    accessor: "feed_comment",
    title: "Коммент",
    sortable: true,
  },
];

export const detailsDict = [
  { label: "Год", value: "years" },
  { label: "Сезон", value: "seasons" },
  { label: "Квартал", value: "quarters" },
  { label: "Месяц", value: "months" },
  { label: "Неделя", value: "weeks" },
  { label: "День", value: "days" },
];

export const subjectDict = [
  { label: "КО", value: "ko" },
  { label: "Питомец", value: "snake" },
  { label: "Питомец и КО", value: "both" },
];

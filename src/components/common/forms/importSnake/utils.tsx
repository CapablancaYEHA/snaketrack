import { ECategories, IFeed, IReqCreateSnake, categoryToMmCat } from "@/api/common";
import { notif } from "@/utils/notif";
import { dateToSupabaseTime } from "@/utils/time";
import { IParsedRocket } from "./types";

export const createSnakes = (raw: IParsedRocket | null, category: ECategories): IReqCreateSnake[] => {
  if (raw == null) return [] as any;
  const res: IReqCreateSnake[] | any[] = [];

  for (const s of raw.animalProfiles) {
    if (s.animalSpecies.title.toLowerCase() !== categoryToMmCat[category]) {
      continue;
    }
    const feed = raw.events?.reduce((tot, cur) => {
      if (cur.animalId === s.id && cur.noteType === "eat") {
        return [
          ...tot,
          {
            feed_last_at: dateToSupabaseTime(cur.date),
            feed_weight: null,
            feed_ko: null,
            feed_comment: cur.description,
          },
        ];
      }
      return tot;
    }, [] as IFeed[]);

    const w: { date: string; weight: number }[] | any[] = [];
    const shed: string[] | any[] = [];

    raw.notes?.forEach((n) => {
      if (n.animalId === s.id) {
        if (n.noteType === "molt") shed.push(dateToSupabaseTime(n.date));
        if (n.noteType === "measurements" && n.value1)
          w.push({
            date: dateToSupabaseTime(n.date),
            weight: n.value2 === "g" ? Number(n.value1) : parseFloat(n.value1.replace(/,/g, ".")) * 1000,
          });
      }
    });

    const snek: IReqCreateSnake = {
      snake_name: s.animalName,
      sex: s.gender.id === 1 ? "male" : s.gender.id === 2 ? "female" : null,
      genes: [{ label: "Normal", gene: "other", hasSuper: false, hasHet: false, id: -1 }],
      date_hatch: dateToSupabaseTime(s.hatchDate),
      origin: "purchase",
      price: null,
      picture: null,
      notes: s.animalMorph.title,
      last_action: "create",
      weight: w,
      feeding: feed,
      shed,
    };
    res.push(snek);
  }

  return res;
};

export const handleJson = async (a: any, callback) => {
  let s = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(a);
    reader.onloadend = () => {
      const dt = reader.result;
      resolve(dt);
    };
    reader.onerror = reject;
  });
  let p: any = await s;
  try {
    const res = JSON.parse(p);
    callback(res);
  } catch (e) {
    uplErr(e);
  }
};

export const handlePost = (post, payload, redirect) =>
  post(payload, {
    onSuccess: () => {
      notif({ c: "green", t: "Успешно", m: "Импорт удался" });
      redirect("/snakes");
    },
    onError: async (err) => {
      notif({
        c: "red",
        t: "Ошибка создания сущностей",
        m: JSON.stringify(err),
        code: err.code || err.statusCode,
      });
    },
  });

export const uplErr = (e: any) =>
  notif({
    c: "red",
    t: "Ошибка обработки JSON",
    m: e.message || "Формат JSON некорректен",
    code: e.code || e.statusCode,
  });

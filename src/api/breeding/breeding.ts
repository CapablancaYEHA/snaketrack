import { dateToSupabaseTime } from "@/utils/time";
import { ECategories, ESupaBreed, IReqCreateSnake, categoryToBaseTable, categoryToShort } from "../common";
import { supaCreate, supaGet, supaUpd } from "../hooks";
import { IFinaliseClutchReq, IFinaliseClutchRes, IReqCreateBreed, IReqCreateClutch, IReqUpdClutch, IResBreedingList, IUpdBreedReq } from "./models";

const isFreshBreedTG = (val: IUpdBreedReq | IReqCreateBreed): val is IReqCreateBreed => {
  return typeof (val as IReqCreateBreed).owner_id !== "undefined";
};

export const makeClutchFromBreed = async (category: ECategories, pl: IUpdBreedReq | IReqCreateBreed) => {
  const cat = categoryToShort[category];
  const userId: string = localStorage.getItem("USER")!;
  if (isFreshBreedTG(pl)) {
    const { data: breedRow, error } = await supaCreate<IReqCreateBreed>({ t: ESupaBreed[`${cat.toUpperCase()}_BREED`], p: pl, bulk: false });
    if (error) {
      throw error;
    }
    const payload: IReqCreateClutch = {
      males_ids: pl.males_ids,
      female_id: pl.female_id,
      owner_id: userId,
      date_laid: dateToSupabaseTime(new Date()),
    };
    const { data, error: errClutch } = await supaCreate<IReqCreateClutch>({ t: ESupaBreed[`${cat.toUpperCase()}_CL`], p: payload, bulk: false });
    if (errClutch) {
      throw errClutch;
    }
    const clutchId = data.id;
    const { error: breedErr } = await supaUpd<IUpdBreedReq>({ t: ESupaBreed[`${cat.toUpperCase()}_BREED`], p: { id: breedRow.id, upd: { status: "clutch", clutch_id: clutchId } } });
    if (breedErr) {
      throw breedErr;
    }
    return data;
  }
  const trg = pl.id;

  const dt = await supaGet<IResBreedingList>({ t: ESupaBreed[`${cat.toUpperCase()}_BREED_V`], f: (b) => b.eq("id", trg).limit(1).single(), id: trg });
  if (!dt) {
    throw { message: "Не удалось получить детализацию плана проекта. Возможно, он был удалён" };
  }
  const payload: IReqCreateClutch = {
    males_ids: dt.breed_males_ids,
    female_id: dt.female_id,
    owner_id: userId,
    date_laid: dateToSupabaseTime(new Date()),
  };
  const { data, error: errClutch } = await supaCreate<IReqCreateClutch>({ t: ESupaBreed[`${cat.toUpperCase()}_CL`], p: payload, bulk: false });
  if (errClutch) {
    throw errClutch;
  }
  const clutchId = data.id;
  const { error } = await supaUpd<IUpdBreedReq>({ t: ESupaBreed[`${cat.toUpperCase()}_BREED`], p: { id: trg, upd: { ...pl.upd, status: "clutch", clutch_id: clutchId } } });

  if (error) {
    throw error;
  }
  return data;
};

export const finaliseClutch = async (category: ECategories, payload: IFinaliseClutchReq): Promise<IFinaliseClutchRes> => {
  const cat = categoryToShort[category];
  const { data, error: insertError } = await supaCreate<IReqCreateSnake[]>({ t: categoryToBaseTable[category], p: payload.snakes, bulk: true });

  if (insertError) {
    throw insertError;
  }
  const { error } = await supaUpd<IReqUpdClutch>({ t: ESupaBreed[`${cat.toUpperCase()}_CL`], p: { upd: payload.clutchUpd.upd as any, id: payload.clutchUpd.id } });

  if (error) {
    throw error;
  }
  return data;
};

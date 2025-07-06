import { IResBpBreedingList } from "@/api/models";

export const makeDefaultValues = (data?: IResBpBreedingList | null) => {
  if (!data) return undefined;
  return {
    female_id: data.female_id,
    malesEvents: data.males_events,
    female_prelay_shed_date: data.female_prelay_shed_date,
    female_ovulation_date: data.female_ovulation_date,
    males_ids: data.breed_males_ids.map((a, ind) => ({ snake: a, id: ind })),
    breed_status: data.breed_status,
  };
};

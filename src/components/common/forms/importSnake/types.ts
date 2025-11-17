export interface IRocketAnimal {
  id: number;
  note: string | null;
  animalName: string;
  hatchDate: string; // 2022-06-12T00:00:00.000
  animalSpecies: { id: number; title: string };
  animalMorph: { id: number; title: string };
  gender: { id: number }; // 1 = самец
  dateOfEating: string;
  eatNote: string;
  nextEventEatingId: number | null;
  imagePath: string | null;
  imagePathSmall: string | null;
  avatar: string | null;
  num: number;
  groupNum: number | null;
  orderDate: string | null;
}

export interface IRocketEvent {
  id: number;
  date: string;
  description: string | null;
  status: boolean;
  animalId: number;
  noteType: "eat" | "event";
  value1: number | null;
  value2: number | null;
  auto: boolean;
  autoType: string;
  autoPeriod: number;
}

export interface IRocketNote {
  id: number;
  date: string;
  description: string | null;
  value1: string | null;
  value2: "g" | "kg" | null;
  noteType: "molt" | "measurements";
  animalId: number;
}

export interface IRocketPhoto {
  id: number;
  animalId: number;
  imageFull: string | null;
  imageSmall: string | null;
}

export interface IParsedRocket {
  animalMorphs: {
    id: number;
    title: string;
  }[];
  animalProfiles: IRocketAnimal[];
  events: IRocketEvent[];
  notes: IRocketNote[];
  photos: IRocketPhoto[];
}

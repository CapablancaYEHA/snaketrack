export const tree = [
  {
    id: "муж",
    gender: "male",
    parents: [],
    siblings: [],
    spouses: [
      {
        id: "жена",
      },
    ],
    children: [],
  },
  {
    id: "жена",
    gender: "female",
    parents: [],
    siblings: [],
    spouses: [
      {
        id: "муж",
      },
      {
        id: "сын",
      },
    ],
    children: [],
  },
  {
    id: "сын",
    gender: "male",
    parents: [
      {
        id: "муж",
      },
      {
        id: "жена",
      },
    ],
    siblings: [],
    spouses: [
      {
        id: "жена",
      },
    ],
    children: [],
  },
  {
    id: "инцест_дочь",
    gender: "female",
    parents: [
      {
        id: "сын",
      },
      {
        id: "жена",
      },
    ],
    siblings: [],
    spouses: [],
    children: [],
  },
];

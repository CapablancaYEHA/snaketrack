export const incestTree = {
  persons: [
    { id: "1", firstName: "Husband" },
    { id: "2", firstName: "Wife" },
    { id: "3", firstName: "Son" },
    { id: "4", firstName: "Incest" },
    { id: "5", firstName: "Incest WIFE" },
  ],
  couples: [
    {
      id: "c1",
      partners: ["1", "2"],
      children: ["3"],
    },
    {
      id: "c2",
      partners: ["2", "3"],
      children: ["4"],
    },
  ],
};

export const kidsNoCouple = {
  persons: [
    { id: "1", firstName: "Marcel" },
    { id: "2", firstName: "Jean" },
    { id: "3", firstName: "Sophie" },
    { id: "4", firstName: "Sophie" },
  ],
  couples: [
    {
      id: "c1",
      partners: ["1"],
      children: ["3", "4"],
    },
  ],
};

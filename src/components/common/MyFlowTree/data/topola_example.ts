/* eslint-disable @typescript-eslint/no-unused-vars */
// topola incest working example
const data = {
  info: "Data source: http://genealogyoflife.com/tng/gedcom/EnglishTudorHouse.ged",
  fams: [
    {
      children: ["I98"],
      husb: "I1",
      wife: "I2",
      id: "F1",
    },
    {
      children: ["J1"],
      husb: "I1",
      wife: "I98",
      id: "F2",
    },
  ],
  indis: [
    {
      // famc: 'F2',
      fams: ["F1"],
      firstName: "Henry",
      id: "I1",
      sex: "M",
    },
    {
      // famc: 'F3',
      fams: ["F1"],
      firstName: "Elizabeth",
      id: "I2",
      sex: "F",
    },
    {
      famc: "F1",
      fams: ["F2"],
      firstName: "Direct",
      id: "I98",
      lastName: "Daughter",
      sex: "F",
    },
    {
      famc: "F2",
      // fams: ['F81', 'F82', 'F83'],
      firstName: "Incest",
      id: "J1",
      lastName: "Son",
      sex: "M",
    },
  ],
};

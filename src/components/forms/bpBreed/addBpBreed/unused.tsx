// TODO делать ли свой калькулятор шансов
// export const calcOdds = (vals: IGenesBpComp[][]) => {
//   const [left, right] = vals;
//   const small = left.length - right.length > 0 ? right : left;
//   const big = left === small ? right : left;

//   return small.reduce((tot, cur) => {
//     return { ...tot, [`${cur.gene}_${cur.label}`]: big.map((r) => `${r.gene}_${r.label}`) };
//   }, {});
// };

// const parseGene = (raw) => {
//   const [gene, rest] = raw.split("_");
//   if (gene === "other") {
//     return { type: "other", hetChance: 0, name: "Normal" };
//   }

//   if (gene === "rec") {
//     const match = rest.match(/^((\d+)% Het |Het )?(\w+)$/);

//     const [, isHet, percent, morph] = match;
//     const hetChance = parseInt(percent ?? "100", 10);
//     return { type: gene, name: morph.trim(), hetChance, isHet: Boolean(isHet) };
//   }

//   return { type: gene, name: rest.trim(), hetChance: 100 };
// };

// export function calcCombos(genePairs) {
//   const results: any[] = [];

//   const addResult = (morph, chance, gene) => {
//     results.push({ morph, chance, gene });
//   };

//   for (const [key, valArray] of Object.entries(genePairs)) {
//     const l = parseGene(key);
//     const arr = (valArray as string[]).map((a) => parseGene(a));

//     arr.forEach((r) => {
//       if (l.type === "rec" && r.type === "rec") {
//         if (l.name === r.name) {
//           if (!l.isHet && !r.isHet) {
//             addResult(l.name, 100, "rec");
//           } else if ((l.isHet && !r.isHet) || (!l.isHet && r.isHet)) {
//             const rec = l.isHet ? r : l;
//             const full = rec === l ? r : l;
//             addResult(full.name, 50, "rec");
//             addResult(`50% Het ${rec.name}`, 50, "rec");
//           } else {
//             addResult(l.name, 25, "rec");
//             addResult(`${(l.hetChance * r.hetChance).toFixed(0)}% Het ${l.name}`, 50, "rec");
//             addResult("Normal", 25, "other");
//           }
//         } else {
//           if (!l.isHet && !r.isHet) {
//             addResult(`50% Het ${l.name}`, 50, "rec");
//             addResult(`50% Het ${r.name}`, 50, "rec");
//           } else if ((l.isHet && !r.isHet) || (!l.isHet && r.isHet)) {
//             const rec = l.isHet ? r : l;
//             const full = rec === l ? r : l;
//             addResult("Normal", 25, "other");
//             addResult(r.name, 25, "rec");
//             addResult(`Het ${full.name} ${(rec.hetChance / 2).toFixed(0)}% Het ${rec.name}`, 50, "rec");
//           } else {
//             addResult(`${(l.hetChance / 2).toFixed(0)}% Het ${l.name} ${(r.hetChance / 2).toFixed(0)}% Het ${r.name}`, 50, "rec");
//           }
//         }
//       } else if (l.type === "inc-dom" && r.type === "inc-dom") {
//         if (l.name === r.name) {
//           addResult(`Super ${l.name}`, 25, "inc-dom");
//           addResult(l.name, 50, "inc-dom");
//           addResult("Normal", 25, "normal");
//         } else {
//           addResult(`${l.name} ${r.name}`, 25, "inc-dom");
//           addResult(l.name, 25, "inc-dom");
//           addResult(r.name, 25, "inc-dom");
//           addResult("Normal", 25, "normal");
//         }
//       } else if ((l.type === "inc-dom" && r.type === "rec") || (l.type === "rec" && r.type === "inc-dom")) {
//         const rec = l.type === "rec" ? l : r;
//         const co = l.type === "inc-dom" ? l : r;

//         const prefix = rec.hetChance < 100 ? `${rec.hetChance}% Het` : "Het";

//         addResult(`${co.name} ${prefix} ${rec.name}`, 50 * (rec.hetChance / 100), "rec");
//         addResult(`${prefix} ${rec.name}`, 50 * (rec.hetChance / 100), "rec");

//         const remainingChance = 100 - rec.hetChance;
//         if (remainingChance > 0) {
//           addResult("Normal", remainingChance, "other");
//         }
//       }
//     });
//   }

//   return results;
// }

import { isEmpty } from "lodash-es";
import * as yup from "yup";
import { IVivRes } from "@/api/common";
import { notif } from "@/utils/notif";

export const defStart = 0;
export const defEnd = 40;

export const defVals = {
  rats_range: [{ range: [defStart, defEnd], quant: 0 }],
  mice_range: [{ range: [defStart, defEnd], quant: 0 }],
  isRats: true,
  isMice: false,
};

export const prepDiap = (k: { [key: string]: number }) =>
  Object.entries(k).map(([left, right]) => ({
    range: left.split("_").map((n) => Number(n)),
    quant: right,
  }));

export const composeInit = (dt: IVivRes) => ({
  rats_range: prepDiap(dt.rat),
  mice_range: prepDiap(dt.mouse),
  isRats: !isEmpty(dt.rat),
  isMice: !isEmpty(dt.mouse),
});

export const vivScheme = yup.object().shape({
  isRats: yup.boolean(),
  isMice: yup.boolean(),
  rats_range: yup.array().when(["isRats"], ([isRats], self) => {
    if (isRats) {
      return self.of(
        yup
          .object({
            range: yup.array().of(yup.number().required()).required(),
            quant: yup.number().required(),
          })
          .required(),
      );
    }
    return self.of(yup.mixed()).notRequired();
  }),
  mice_range: yup.array().when(["isMice"], ([isMice], self) => {
    if (isMice) {
      return self.of(
        yup
          .object({
            range: yup.array().of(yup.number().required()).required(),
            quant: yup.number().required(),
          })
          .required(),
      );
    }
    return self.of(yup.mixed()).notRequired();
  }),
});

export const dummy = yup.object().shape({});

export type IVivScheme = yup.InferType<typeof vivScheme>;

export const prepForCreate = (sub: IVivScheme) => {
  let resRats: undefined;
  let resMice: undefined;
  if (sub.isRats) {
    resRats = sub.rats_range?.reduce((tot, cur) => {
      return { ...tot, [cur.range.join("_")]: cur.quant };
    }, {});
  }
  if (sub.isMice) {
    resMice = sub.mice_range?.reduce((tot, cur) => {
      return { ...tot, [cur.range.join("_")]: cur.quant };
    }, {});
  }

  return {
    rat: resRats,
    mouse: resMice,
  };
};

export const prepForUpdate = (sub: IVivScheme, isDirtyRats: boolean, isDirtyMice: boolean) => {
  // eslint-disable-next-line no-undef-init
  let updRats = undefined;
  // eslint-disable-next-line no-undef-init
  let updMice = undefined;

  if (isDirtyRats) {
    updRats = sub.rats_range?.reduce((tot, cur) => {
      return { ...tot, [cur.range.join("_")]: cur.quant };
    }, {});
  }
  if (isDirtyMice) {
    updMice = sub.mice_range?.reduce((tot, cur) => {
      return { ...tot, [cur.range.join("_")]: cur.quant };
    }, {});
  }

  return {
    rat: updRats,
    mouse: updMice,
  };
};

export function reducer(state, action) {
  switch (action.type) {
    case "change":
      return {
        ...state,
        [action.payload.range]: action.payload.quantity,
      };
    case "reset":
      return action.payload;
    default:
      return state;
  }
}

// FIXME сделать throw вместо notif ? убрать касты as any ?
// здесь нету нотифа на случай если граммовка из несуществующей категории вообще
export const prepVivUpd = (current: IVivRes, feed_weight: number, viv: string) => {
  const ent = Object.entries(current[viv]);

  for (const diapason of ent) {
    const [left, right] = diapason;
    const [s, e] = left.split("_");

    if (Number(s) <= feed_weight && feed_weight <= Number(e)) {
      if (Number(right) === 0) {
        notif({ c: "red", t: "Вивариум не будет обновлен", m: "Для данной граммовки уже 0 в наличии" });
        return undefined;
      }
      return {
        [viv]: {
          ...current[viv],
          [left]: Number(right) - 1,
        },
      };
    }
    return undefined;
  }
};

// .test({
//   name: "custom-validation",
//   test: (value, context) => {
//     const base = context.originalValue.map((o) => o.range);
//     const res = base.map((el, ind, self) => {
//       const [start, end] = el;
//       //   проверка слабая, чекает только предыдущий ряд, но пересечения могут быть и раньше и позже
//       if (ind > 0) {
//         const [prevStart, prevEnd] = self[ind - 1];
//         const isCorrect = start > prevEnd && end > prevEnd;
//         return { ind, isError: !isCorrect };
//       }
//       return { ind, isError: false };
//     }, []);
//     return true;
//   },
// }),

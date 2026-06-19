type IElem = { id: string };

interface IRaw {
  id: string;
  gender: string;
  parents: IElem[];
  siblings: IElem[];
  spouses: IElem[];
  children: IElem[];
}

interface INode extends IRaw {
  level: number;
  left: number;
  top: number;
}

const calcDepth = (targetNode: IRaw | undefined, currLevel, arr): number => {
  if (!targetNode) return 0;
  if (targetNode.parents.length === 0) {
    return currLevel + 1;
  }

  const iter = targetNode.parents.map((p) => arr.find((filtered) => filtered.id === p.id));

  return Math.max(...iter.map((a) => calcDepth(a, currLevel + 1, arr)));
};

type IStore = {
  [key: string]: INode;
};
const familyStore: IStore = {};

export const calcTree = (rpc_nodes: IRaw[]): any[] => {
  rpc_nodes.forEach((n, i, self) => {
    let level: null | number = null;
    let left: number = 0;
    // ищем руты
    if (n.parents?.length === 0) {
      level = 0;
    } else {
      // нужен ли этот фильтрованный массив и надо ли из него еще и родителей убрать?

      const exclSelf = self.filter((_, ind) => i !== ind);
      const iter = n.parents.map((p) => exclSelf.find((filtered) => filtered.id === p.id));
      level = Math.max(...iter.map((a) => calcDepth(a, 0, exclSelf)));
    }
    // ищем супругов
    if (n.spouses) {
      // проверка на level перед отсчетом отступов наверно не нужна? но как это влияет на корректность отображения бридинга
      if (i === 0) {
        left = -1;
      } else {
        left = n.spouses.reduce((tot, cur) => {
          if (familyStore[cur.id]) {
            return tot + 1;
          }
          return tot;
        }, left);
      }
    }

    familyStore[n.id] = { ...n, level, left, top: level * 2 };
  });

  return Object.values(familyStore);
};

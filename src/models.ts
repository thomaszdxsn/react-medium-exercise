import type { TreeItem } from "./interface";

export function buildTree<T extends { id: string; parent: string | null }>(
  items: T[]
): TreeItem<T>[] {
  const roots: TreeItem<T>[] = [];
  const itemMap = new Map();
  items.forEach((item) => {
    const treeItem = {
      id: item.id,
      parent: item.parent,
      item: item,
      children: [],
    };
    itemMap.set(treeItem.id, treeItem);
    if (treeItem.parent === null) {
      roots.push(treeItem);
    }
  });
  itemMap.forEach((treeItem) => {
    if (treeItem.parent !== null) {
      const parent = itemMap.get(treeItem.parent);
      if (parent === undefined) {
        throw new Error("parent not found");
      }
      parent.children.push(treeItem);
    }
  });

  return roots;
}

export function getTreeDFSArray() {
  return [];
}

export function useFieldTree() {
  return [];
}

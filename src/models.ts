import type { TreeItem } from "./interfaces";

interface TreeNodeLike {
  id: string;
  parent: string | null;
}

export function buildTree<T extends TreeNodeLike>(items: T[]): TreeItem<T>[] {
  const roots: TreeItem<T>[] = [];
  const itemMap = new Map();
  const duplicateSet = new Set();
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
    if (duplicateSet.has(treeItem.id)) {
      throw new Error("duplicate tree item id");
    }
    duplicateSet.add(treeItem.id);
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

export function flattenTreeByDfs<T>(roots: TreeItem<T>[]) {
  function flatten<T>(item: TreeItem<T>): TreeItem<T>[] {
    return [item, ...item.children.flatMap((child) => flatten(child))];
  }
  return roots.flatMap((root) => flatten(root));
}

export function useFieldTree() {
  return [];
}

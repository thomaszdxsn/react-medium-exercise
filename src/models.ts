import type { TreeItem } from "./interface";

interface TreeLike {
  id: string;
  parent: string | null;
}

export function buildTree<T extends TreeLike>(items: T[]): TreeItem<T>[] {
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

export function getTreeDFSArray<T extends TreeLike>(roots: TreeItem<T>[]) {
  function flatten<T extends TreeLike>(item: TreeItem<T>): TreeItem<T>[] {
    return item.children.flatMap((child) => flatten(child));
  }
  return roots.map((root) => flatten(root));
}

export function useFieldTree() {
  return [];
}

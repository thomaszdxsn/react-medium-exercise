import { buildTree } from "../src/models";

test("test buildTree all roots", () => {
  const items = [
    { id: "1", parent: null },
    { id: "2", parent: null },
    { id: "3", parent: null },
  ];
  const treeRoots = buildTree(items);

  expect(treeRoots.length).toBe(3);
  expect(treeRoots.every((item) => item.children.length === 0)).toBe(true);
});

test("test buildTree with children", () => {
  const items = [
    { id: "1", parent: null },
    { id: "2", parent: "1" },
    { id: "3", parent: "2" },
  ];
  const treeRoots = buildTree(items);

  expect(treeRoots).toHaveLength(1);
  let node = treeRoots[0];
  expect(node.id).toBe("1");
  expect(node.children).toHaveLength(1);
  node = node.children[0];
  expect(node.id).toBe("2");
  expect(node.children).toHaveLength(1);
  node = node.children[0];
  expect(node.id).toBe("3");
  expect(node.children).toHaveLength(0);
});

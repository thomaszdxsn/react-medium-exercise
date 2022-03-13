import {
  buildTree,
  flattenTreeByDfs,
  initFormData,
  submitFormData,
} from "../src/models";

describe("test buildTree", () => {
  test("test buildTree error when parent is not exists", () => {
    const items = [
      { id: "1", parent: null },
      { id: "2", parent: "3" },
    ];
    expect(() => buildTree(items)).toThrow();
  });

  test("test buildTree error when item id duplicate", () => {
    const items = [
      { id: "1", parent: null },
      { id: "1", parent: null },
      { id: "2", parent: null },
    ];
    expect(() => buildTree(items)).toThrow();
  });

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

  test("test flattenTreeByDfs", () => {
    const items = [
      { id: "3", parent: "2" },
      { id: "1", parent: null },
      { id: "2", parent: "1" },
    ];

    const treeRoots = buildTree(items);
    const nodes = flattenTreeByDfs(treeRoots);
    expect(nodes.map((node) => node.id)).toEqual(["1", "2", "3"]);
  });
});

describe("form data", () => {
  const orgType = "organization" as const;
  const mockOrgs = [
    {
      id: "org1",
      name: "org1",
      parent: null,
      type: orgType,
      representation: "member1",
      members: ["member1", "member2"],
    },
    {
      id: "org2",
      name: "org2",
      parent: "org1",
      representation: "member4",
      type: orgType,
      members: ["member3", "member4"],
    },
  ];
  const mockMembers = [
    {
      id: "member1",
      name: "member1",
      age: 1,
      status: "activated" as const,
    },
    {
      id: "member2",
      name: "member2",
      age: 2,
      status: "activated" as const,
    },
    {
      id: "member3",
      name: "member3",
      age: 3,
      status: "activated" as const,
    },
    {
      id: "member4",
      name: "member4",
      age: 4,
      status: "activated" as const,
    },
  ];
  test("init form data", () => {
    const formData = initFormData({ orgs: mockOrgs, members: mockMembers });
    const org1Members = formData.orgs.find((o) => o.id === "org1")!.members;
    const member1 = org1Members.find((m) => m.name === "member1")!;
    const member2 = org1Members.find((m) => m.name === "member2")!;
    expect(member1.activated).toBeTruthy();
    expect(member1.representation).toBeTruthy();
    expect(member2.representation).toBeFalsy();
  });

  test("submit from data", () => {
    const formData = initFormData({ orgs: mockOrgs, members: mockMembers });
    const submitData = submitFormData(formData);

    expect(submitData.orgs).toEqual(mockOrgs);
    expect(submitData.members).toEqual(mockMembers);
  });

  test("test init form data would sort orgs by dfs", () => {
    const clonedOrgs = [...mockOrgs];
    [clonedOrgs[1], clonedOrgs[0]] = [clonedOrgs[0], clonedOrgs[1]];
    const formData = initFormData({ orgs: clonedOrgs, members: mockMembers });
    expect(formData.orgs.map((org) => org.name)).toEqual(["org1", "org2"]);
  });
});

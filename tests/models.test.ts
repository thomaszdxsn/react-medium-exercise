import {
  buildTree,
  flattenTreeByDfs,
  initFormData,
  submitFormData,
} from "../src/models";

describe("test buildTree", () => {
  test("test buildTree error when parent is not exists", () => {
    const items = [
      { identifier: "1", parent: null },
      { identifier: "2", parent: "3" },
    ];
    expect(() => buildTree(items)).toThrow();
  });

  test("test buildTree error when item identifier duplicate", () => {
    const items = [
      { identifier: "1", parent: null },
      { identifier: "1", parent: null },
      { identifier: "2", parent: null },
    ];
    expect(() => buildTree(items)).toThrow();
  });

  test("test buildTree all roots", () => {
    const items = [
      { identifier: "1", parent: null },
      { identifier: "2", parent: null },
      { identifier: "3", parent: null },
    ];
    const treeRoots = buildTree(items);

    expect(treeRoots.length).toBe(3);
    expect(treeRoots.every((item) => item.children.length === 0)).toBe(true);
  });

  test("test buildTree with children", () => {
    const items = [
      { identifier: "1", parent: null },
      { identifier: "2", parent: "1" },
      { identifier: "3", parent: "2" },
    ];
    const treeRoots = buildTree(items);

    expect(treeRoots).toHaveLength(1);
    let node = treeRoots[0];
    expect(node.identifier).toBe("1");
    expect(node.children).toHaveLength(1);
    node = node.children[0];
    expect(node.identifier).toBe("2");
    expect(node.children).toHaveLength(1);
    node = node.children[0];
    expect(node.identifier).toBe("3");
    expect(node.children).toHaveLength(0);
  });

  test("test flattenTreeByDfs", () => {
    const items = [
      { identifier: "3", parent: "2" },
      { identifier: "1", parent: null },
      { identifier: "2", parent: "1" },
    ];

    const treeRoots = buildTree(items);
    const nodes = flattenTreeByDfs(treeRoots);
    expect(nodes.map((node) => node.identifier)).toEqual(["1", "2", "3"]);
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
    const org1Members = formData.orgs.find(
      (o) => o.identifier === "org1"
    )!.members;
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

import type { TreeItem, Organization, Member, FormValues } from "./interfaces";
import {
  Resolver,
  useFormContext as originUseFormContext,
} from "react-hook-form";

interface TreeNodeLike {
  id: string;
  parent: string | null;
}

interface DomainData {
  orgs: Organization[];
  members: Member[];
}

export const useFormContext = () => originUseFormContext<FormValues>();

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

export function sortTreeArrayByDfs<T extends TreeNodeLike>(items: T[]) {
  const roots = buildTree(items);
  const dfsArray = flattenTreeByDfs(roots);
  return dfsArray.map((node) => node.item);
}

export function initFormData(
  { orgs, members }: DomainData,
  sortByDfs = true,
  ignoreNotExistsMember = true
): FormValues {
  const memberMap = new Map(members.map((member) => [member.id, member]));

  const result = orgs.map((org) => {
    const members = ignoreNotExistsMember
      ? org.members.filter((m) => memberMap.has(m))
      : org.members;
    return {
      id: org.id,
      name: org.name,
      parent: org.parent,
      members: members.map((memberId) => {
        const member = memberMap.get(memberId);
        if (!member) {
          throw new Error("member is not exists");
        }
        return {
          name: member.name,
          activated: member.status === "activated",
          age: member.age ?? null,
          representation: org.representation === memberId,
        };
      }),
    };
  });
  return { orgs: sortByDfs ? sortTreeArrayByDfs(result) : result };
}

export function submitFormData(formData: FormValues): DomainData {
  const orgs: Organization[] = [];
  const members: Member[] = [];
  formData.orgs.forEach((org) => {
    orgs.push({
      id: org.name,
      name: org.name,
      parent: org.parent,
      members: org.members.map((m) => m.name),
      type: "organization",
      representation: org.members.find((m) => m.representation)?.name,
    });
    members.push(
      ...org.members.map((member) => {
        const status: Member["status"] = member.activated
          ? "activated"
          : "inactivated";
        const age = member.age && ~isNaN(member.age) ? member.age : undefined;
        return {
          id: member.name,
          name: member.name,
          age,
          status,
        };
      })
    );
  });
  return {
    orgs,
    members,
  };
}

const validateDuplicateOrgName = (values: FormValues) => {
  const nameSet = new Set();
  const duplicateOrgPaths: string[] = [];

  values.orgs.forEach((org, index) => {
    if (!nameSet.has(org.name)) {
      nameSet.add(org.name);
    } else {
      const name = `orgs.${index}.name` as const;
      duplicateOrgPaths.push(name);
    }
  });
  return Object.fromEntries(
    duplicateOrgPaths.map((path) => [
      path,
      { type: "duplicate", message: "organization's name must be unique" },
    ])
  );
};

const validateDuplicateMemberName = (values: FormValues) => {
  const nameSet = new Set();
  const duplicateMemberPaths: string[] = [];

  values.orgs.forEach((org, index) => {
    const orgName = `orgs.${index}` as const;
    org.members.forEach((member) => {
      if (!nameSet.has(member.name)) {
        nameSet.add(member.name);
      } else {
        const name = `${orgName}.members.${index}.name` as const;
        duplicateMemberPaths.push(name);
      }
    });
  });
  return Object.fromEntries(
    duplicateMemberPaths.map((path) => [
      path,
      { type: "duplicate", message: "member's name must be unique" },
    ])
  );
};

export const resolver: Resolver<FormValues> = (values) => {
  const orgErrors = validateDuplicateOrgName(values);
  const memberErrors = validateDuplicateMemberName(values);

  return {
    values,
    errors: {
      ...orgErrors,
      ...memberErrors,
    },
  };
};

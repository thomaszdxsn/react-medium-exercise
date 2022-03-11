export interface Member {
  name: string;
  id: string;
  age: number;
  status: "activated" | "inactivated";
}

export interface Organization {
  name: string;
  id: string;
  type: "organization";
  parent: string | null;
  representation: string;
  members: string[];
}

export interface TreeItem<T> {
  id: string;
  parent: string | null;
  children: TreeItem<T>[];
  item: T;
}

export interface Member {
  name: string;
  id: string;
  age?: number;
  status: "activated" | "inactivated";
}

export interface Organization {
  name: string;
  id: string;
  type: "organization"; // only "organization" yet
  parent: string | null;
  representation?: string;
  members: string[];
}

export interface TreeItem<T> {
  id: string;
  parent: string | null;
  children: TreeItem<T>[];
  item: T;
}

interface FormMemberField {
  name: string;
  age: number | null;
  activated: boolean;
  representation: boolean;
}
interface FormOrgField {
  // ???
  id: string;
  parent: string | null;
  name: string;
  members: FormMemberField[];
}

export interface FormValues {
  orgs: FormOrgField[];
}

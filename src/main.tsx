import React from "react";
import ReactDOM from "react-dom";
import type { Member, Organization } from "./interfaces";
import orgData from "./data/orgs.json";
import memberData from "./data/members.json";
import { initFormData } from "./models";
import App from "./App";

import "./global.css";

const pathname = window.location.pathname;
const showMock = pathname.startsWith("/mock");

const mockData = initFormData({
  orgs: orgData.map((org) => ({
    ...org,
    members: org.members ?? [],
  })) as Organization[],
  members: memberData as Member[],
});

ReactDOM.render(
  <React.StrictMode>
    <App defaultValues={showMock ? mockData : undefined} />
  </React.StrictMode>,
  document.getElementById("root")
);

import React from "react";
import ReactDOM from "react-dom";
import type { DomainData, Member, Organization } from "./interfaces";
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

const onSubmit = (domainData: DomainData) => {
  const data = JSON.stringify(domainData, null, 2);
  console.log(data);
  alert(data);
};

ReactDOM.render(
  <React.StrictMode>
    <App defaultValues={showMock ? mockData : undefined} onSubmit={onSubmit} />
  </React.StrictMode>,
  document.getElementById("root")
);

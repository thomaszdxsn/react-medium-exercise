import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import MemberFieldSet from "./components/MemberFieldSet";
import OrganizationCard from "./components/OrganizationCard";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <OrganizationCard />
      <MemberFieldSet />
    </>
  );
}

export default App;

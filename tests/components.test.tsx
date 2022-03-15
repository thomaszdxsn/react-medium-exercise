import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import App from "../src/App";

test("test append organization", () => {
  render(<App />);
  expect(screen.queryAllByRole("organization-card")).toHaveLength(0);
  fireEvent.click(screen.getByRole("append-organization"));
  expect(screen.queryAllByRole("organization-card")).toHaveLength(1);
});

test("test cancel form would restore to defaultValues", () => {
  render(
    <App
      defaultValues={{
        orgs: [
          {
            name: "default value",
            id: "default value",
            parent: null,
            members: [],
          },
        ],
      }}
    />
  );
  const getInput = () => screen.getByRole("organization-name");
  fireEvent.input(getInput(), {
    target: { value: "new value" },
  });
  expect(getInput()).toHaveValue("new value");
  fireEvent.click(screen.getByRole("cancel-button"));
  expect(getInput()).toHaveValue("default value");
});

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import App from "../src/App";
import { DomainData } from "../src/interfaces";
import { initFormData } from "../src/models";
import { FieldError } from "react-hook-form";

test("test cancel form would restore to defaultValues", () => {
  render(
    <App
      defaultValues={{
        orgs: [
          {
            name: "default value",
            identifier: "default value",
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

test("test append organization", () => {
  render(<App />);
  expect(screen.queryAllByRole("organization-card")).toHaveLength(0);
  fireEvent.click(screen.getByRole("append-organization-button"));
  expect(screen.queryAllByRole("organization-card")).toHaveLength(1);
});

test("test submit would transform to domain data", async () => {
  const domainData = {
    orgs: [
      {
        id: "org1",
        name: "org1",
        parent: null,
        members: ["member1", "member2"],
        type: "organization" as const,
        representation: "member2",
      },
    ],
    members: [
      { id: "member1", name: "member1", status: "activated" as const, age: 18 },
      { id: "member2", name: "member2", status: "activated" as const, age: 18 },
    ],
  };
  const mockSubmit: jest.MockedFunction<(arg0: DomainData) => void> = jest.fn();
  render(
    <App defaultValues={initFormData(domainData)} onSubmit={mockSubmit} />
  );
  await act(
    async () => void fireEvent.click(screen.getByRole("submit-button"))
  );
  expect(mockSubmit.mock.calls[0][0]).toStrictEqual(domainData);
});

test("test remove organization", () => {
  render(
    <App
      defaultValues={{
        orgs: [{ name: "org", identifier: "org", parent: null, members: [] }],
      }}
    />
  );
  const getOrgCards = () => screen.queryAllByRole("organization-card");
  expect(getOrgCards()).toHaveLength(1);
  fireEvent.click(screen.getByRole("remove-organization-button"));
  expect(getOrgCards()).toHaveLength(0);
});

test("test append member", () => {
  render(
    <App
      defaultValues={{
        orgs: [
          {
            name: "default value",
            identifier: "default value",
            parent: null,
            members: [],
          },
        ],
      }}
    />
  );
  const getMemberFieldSets = () => screen.queryAllByRole("member-field-set");
  expect(getMemberFieldSets()).toHaveLength(0);
  fireEvent.click(screen.getByRole("append-member-button"));
  expect(getMemberFieldSets()).toHaveLength(1);
});

test("test can remove member", async () => {
  render(
    <App
      defaultValues={{
        orgs: [
          {
            name: "default value",
            identifier: "default value",
            parent: null,
            members: [
              {
                name: "member1",
                age: 18,
                activated: true,
                representation: true,
              },
            ],
          },
        ],
      }}
    />
  );

  const getAllMembers = () => screen.queryAllByRole("member-field-set");
  expect(getAllMembers()).toHaveLength(1);
  await act(
    async () => void fireEvent.click(screen.getByRole("remove-member-button"))
  );
  expect(getAllMembers()).toHaveLength(0);
});

test("test uncheck activated make representation disabled & unchecked", async () => {
  render(
    <App
      defaultValues={{
        orgs: [
          {
            name: "default value",
            identifier: "default value",
            parent: null,
            members: [
              {
                name: "member",
                age: 18,
                activated: true,
                representation: true,
              },
            ],
          },
        ],
      }}
    />
  );
  const getRepresentationField = () =>
    screen.getByRole("member-representation");
  expect(getRepresentationField()).toBeChecked();
  expect(getRepresentationField()).not.toBeDisabled();

  fireEvent.click(screen.getByRole("member-activated"));

  expect(screen.getByRole("member-activated")).not.toBeChecked();
  const field = getRepresentationField();

  expect(field).toBeDisabled();
  expect(field).not.toBeChecked();
});

test("test can only check one representation in one organization", async () => {
  render(
    <App
      defaultValues={{
        orgs: [
          {
            name: "org1",
            identifier: "org1",
            parent: null,
            members: [
              {
                name: "member1",
                age: 18,
                activated: true,
                representation: false,
              },

              {
                name: "member2",
                age: 18,
                activated: true,
                representation: true,
              },
            ],
          },
        ],
      }}
    />
  );

  const getMembersRepresentation = () =>
    screen.getAllByRole("member-representation");
  let checkboxes = getMembersRepresentation();
  expect(checkboxes[0]).not.toBeChecked();
  expect(checkboxes[1]).toBeChecked();

  await act(async () => void fireEvent.click(getMembersRepresentation()[0]));

  checkboxes = getMembersRepresentation();
  expect(checkboxes[0]).toBeChecked();
  expect(checkboxes[1]).not.toBeChecked();
});

describe("test form validation", () => {
  const buildMockOnError: () => jest.MockedFunction<
    (arg0: Record<string, FieldError>) => void
  > = () => jest.fn();

  test("test org.name must be unique", async () => {
    const mockOnError = buildMockOnError();
    render(
      <App
        onError={mockOnError}
        defaultValues={{
          orgs: [
            {
              identifier: "org",
              name: "org",
              parent: null,
              members: [],
            },
            {
              identifier: "org",
              name: "org",
              parent: null,
              members: [],
            },
          ],
        }}
      />
    );
    await act(
      async () => void fireEvent.click(screen.getByRole("submit-button"))
    );
    expect(mockOnError).toBeCalled();
    expect(mockOnError).toBeCalledWith({
      "orgs.1.name": {
        type: "duplicate",
        message: "organization's name must be unique",
      },
    });
  });

  test("test member.name must be unique", async () => {
    const mockOnError = buildMockOnError();
    render(
      <App
        onError={mockOnError}
        defaultValues={{
          orgs: [
            {
              identifier: "org",
              name: "org",
              parent: null,
              members: [
                {
                  name: "member",
                  age: 18,
                  activated: true,
                  representation: false,
                },
                {
                  name: "member",
                  age: 18,
                  activated: true,
                  representation: false,
                },
              ],
            },
          ],
        }}
      />
    );
    await act(
      async () => void fireEvent.click(screen.getByRole("submit-button"))
    );
    expect(mockOnError).toBeCalled();
    expect(mockOnError).toBeCalledWith({
      "orgs.0.members.1.name": {
        type: "duplicate",
        message: "member's name must be unique",
      },
    });
  });
});

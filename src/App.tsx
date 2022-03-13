import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import OrganizationCard from "./components/OrganizationCard";
import { initFormData, useFormContext } from "./models";
import type { Member, Organization, FormValues } from "./interfaces";

import orgData from "./data/orgs.json";
import memberData from "./data/members.json";

import "./App.css";

const defaultValues = initFormData({
  orgs: orgData.map((org) => ({
    ...org,
    members: org.members ?? [],
  })) as Organization[],
  members: memberData as Member[],
});

function CardContainer() {
  const { control } = useFormContext();
  const { fields } = useFieldArray({ control, name: "orgs" });
  const cards = fields.map((field, index) => (
    <OrganizationCard key={field.id} name={`orgs.${index}`} />
  ));
  return <div className="flex flex-col gap-2">{cards}</div>;
}

function App() {
  const methods = useForm<FormValues>({ defaultValues });
  return (
    <FormProvider {...methods}>
      <main className="p-2 h-screen bg-gray-200 overflow-y-scroll">
        <CardContainer />
      </main>
    </FormProvider>
  );
}

export default App;

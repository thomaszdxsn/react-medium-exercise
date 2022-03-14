import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import OrganizationCard from "./components/OrganizationCard";
import { initFormData, submitFormData, useFormContext } from "./models";
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

function ActionFooter() {
  const { reset } = useFormContext();
  const onCancel = () => reset();

  const btnClassName =
    "shadow-2xl px-4 py-2 min-w-[200px] bg-white rounded hover:opacity-80";

  return (
    <div className="flex justify-center gap-2">
      <button className={btnClassName} onClick={onCancel}>
        Cancel
      </button>
      <button className={btnClassName} type="submit">
        Submit
      </button>
    </div>
  );
}

function App() {
  const methods = useForm<FormValues>({ defaultValues });
  const { handleSubmit } = methods;
  const onSubmit = handleSubmit((formData) => {
    const result = submitFormData(formData);
    console.table(result.orgs);
    console.table(result.members);
    alert(JSON.stringify(result, null, 2));
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-2 h-screen p-2 bg-gray-200">
          <main className="overflow-y-scroll">
            <CardContainer />
          </main>
          <ActionFooter />
        </div>
      </form>
    </FormProvider>
  );
}

export default App;

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import OrganizationCard from "./components/OrganizationCard";
import { resolver, submitFormData, useFormContext } from "./models";
import Button from "./components/Button";
import { FiPlus } from "react-icons/fi";
import type { FormValues } from "./interfaces";

function CardContainer() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "orgs" });
  const cards = fields.map((field, index) => (
    <OrganizationCard
      key={field.id}
      name={`orgs.${index}`}
      removeSelf={() => remove(index)}
    />
  ));

  const onAppend = () => append({ name: "", members: [] });
  const appendButton = (
    <button
      type="button"
      onClick={onAppend}
      className="border-dashed border-gray-800 border bg-white w-full flex justify-center items-center h-8 hover:opacity-80 shadow hover:shadow-xl"
      role="append-organization"
    >
      <FiPlus />
    </button>
  );
  return (
    <div className="flex flex-col gap-2">
      {cards} {appendButton}
    </div>
  );
}

function ActionFooter() {
  const { reset } = useFormContext();
  const onCancel = () => reset();
  const btnClassName = "min-w-[200px]";

  return (
    <div className="flex justify-center gap-2">
      <Button className={btnClassName} onClick={onCancel} role="cancel-button">
        Cancel
      </Button>
      <Button className={btnClassName} type="submit" role="submit-button">
        Submit
      </Button>
    </div>
  );
}

function App({ defaultValues = { orgs: [] } }: { defaultValues?: FormValues }) {
  const methods = useForm<FormValues>({
    defaultValues,
    shouldUseNativeValidation: true,
    mode: "onChange",
    resolver,
  });
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
        <div className="flex flex-col gap-2 h-screen p-4 bg-gray-200">
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

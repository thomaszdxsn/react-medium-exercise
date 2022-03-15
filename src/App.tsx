import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import OrganizationCard from "./components/OrganizationCard";
import { resolver, submitFormData, useFormContext } from "./models";
import Button from "./components/Button";
import { FiPlus } from "react-icons/fi";
import type { FormValues } from "./interfaces";

function CardContainer() {
  const sensors = useSensors(useSensor(PointerSensor));
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
  const onDragEnd = (event: DragEndEvent) => {
    const activeData = event.active.data.current;
    const overData = event.over?.data.current;
    const bothMemberType =
      activeData?.type === "member" && overData?.type === "member";
    const isSameContainer =
      activeData?.sortable.containerId === overData?.sortable.containerId;
    switch (true) {
      case bothMemberType && isSameContainer:
        activeData!["move"](activeData!.index, overData!.index);
        break;
      case bothMemberType && !isSameContainer:
        const field = activeData!["field"];
        console.log(field);
        activeData!["remove"](activeData!.index);
        overData!["insert"](overData!.index, field);
        break;
    }
  };
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex flex-col gap-2">
        {cards} {appendButton}
      </div>
      <DragOverlay>
        <div>Hello World</div>
      </DragOverlay>
    </DndContext>
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

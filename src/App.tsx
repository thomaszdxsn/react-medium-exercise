import {
  useForm,
  FormProvider,
  useFieldArray,
  FieldError,
} from "react-hook-form";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  MeasuringStrategy,
  CollisionDetection,
} from "@dnd-kit/core";
import { FiPlus } from "react-icons/fi";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import OrganizationCard from "./components/OrganizationCard";
import { resolver, submitFormData, useFormContext } from "./models";
import Button from "./components/Button";
import type { DomainData, FormValues } from "./interfaces";
import { nanoid } from "nanoid";

const customCollisionDetection: CollisionDetection = (args) => {
  const { active, droppableContainers } = args;
  console.log({ droppableContainers });
  if (
    active?.data.current?.type === "organization" &&
    droppableContainers.length > 0
  ) {
    const firstOrg = droppableContainers.find(
      (c) => c.data.current?.type === "organization"
    );
    return firstOrg ? [{ id: firstOrg.id }] : [];
  }
  return closestCenter(args);
};

function CardContainer() {
  const sensors = useSensors(useSensor(PointerSensor));
  const { control } = useFormContext();
  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name: "orgs",
  });
  const cards = fields.map((field, index) => (
    <OrganizationCard
      key={field.id}
      name={`orgs.${index}`}
      insert={insert}
      move={move}
      remove={remove}
      index={index}
    />
  ));

  const onAppend = () =>
    append({ name: "", members: [], id: nanoid(), parent: null });
  const appendButton = (
    <button
      type="button"
      onClick={onAppend}
      className="border-dashed border-gray-800 border bg-white w-full flex justify-center items-center h-8 hover:opacity-80 shadow hover:shadow-xl"
      role="append-organization-button"
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
    const bothOrgType =
      activeData?.type === "organization" && overData?.type === "organization";
    console.log({ activeData, overData, bothOrgType });
    switch (true) {
      case bothMemberType && isSameContainer:
        activeData!["move"](activeData!.index, overData!.index);
        break;
      case bothMemberType && !isSameContainer:
        const field = activeData!["field"];
        activeData!["remove"](activeData!.index);
        overData!["insert"](overData!.index, field);
        break;
      case bothOrgType:
        activeData!["move"](activeData!.index, overData!.index);
        break;
    }
  };
  console.log({ cards });
  return (
    <DndContext
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      sensors={sensors}
      onDragEnd={onDragEnd}
      collisionDetection={customCollisionDetection}
    >
      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {cards} {appendButton}
        </div>
        <DragOverlay>
          <div>Hello World</div>
        </DragOverlay>
      </SortableContext>
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

function App({
  defaultValues = { orgs: [] },
  onSubmit,
  onError,
}: {
  defaultValues?: FormValues;
  onSubmit?: (arg0: DomainData) => void;
  onError?: (arg0: Record<string, FieldError>) => void;
}) {
  const methods = useForm<FormValues>({
    defaultValues,
    shouldUseNativeValidation: true,
    mode: "onChange",
    resolver,
  });
  const { handleSubmit, trigger } = methods;
  const submitHandler = handleSubmit(
    (formData) => {
      onSubmit?.(submitFormData(formData));
    },
    (errors) => {
      onError?.(errors as Record<string, FieldError>);
    }
  );
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          trigger();
          submitHandler(e);
        }}
      >
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

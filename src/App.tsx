import { useMemo, useState } from "react";
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
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  defaultDropAnimation,
  DragMoveEvent,
} from "@dnd-kit/core";
import { FiPlus } from "react-icons/fi";
import { nanoid } from "nanoid";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import OrganizationCard from "./components/OrganizationCard";
import {
  isAncestor,
  MEMBER,
  ORGANIZATION,
  ORG_INDENT_WIDTH,
  resolver,
  submitFormData,
  useFormContext,
} from "./models";
import Button from "./components/Button";
import type { DomainData, FormOrgField, FormValues } from "./interfaces";
import DragHandle from "./components/DragHandle";

const customCollisionDetection: CollisionDetection = (args) => {
  const { active } = args;
  if (active?.data.current?.type === "organization") {
    const pointerIntersections = pointerWithin(args);
    const intersections =
      pointerIntersections.length > 0
        ? pointerIntersections
        : rectIntersection(args);
    const over = getFirstCollision(
      intersections.filter(
        (x) =>
          x.data?.droppableContainer?.data?.current?.type === "organization"
      )
    );
    return over ? [{ id: over.id }] : [];
  }
  return closestCenter(args);
};

function getFieldLevel(
  map: Map<string, FormOrgField>,
  id: string,
  level = 0
): number {
  const field = map.get(id);
  return field?.parent ? getFieldLevel(map, field.parent, level + 1) : level;
}

function clamp(min: number, value: number, max: number) {
  return min > value ? min : max < value ? max : value;
}

function calcOrgDraggingPosition(
  orgs: FormOrgField[],
  activeId: string,
  overId: string,
  deltaX: number,
  indentWidth = ORG_INDENT_WIDTH
): { level: number; parent: string | null } {
  const activeIndex = orgs.findIndex((org) => org.identifier === activeId)!;
  const overIndex = orgs.findIndex((org) => org.identifier === overId)!;
  const newOrgs = arrayMove(orgs, activeIndex, overIndex);
  const nextOrg = newOrgs[overIndex + 1];
  const prevOrg = newOrgs[overIndex - 1];

  const map = new Map(orgs.map((org) => [org.identifier, org]));
  const deltaLevel = Math.round(deltaX / indentWidth);
  const minLevel = nextOrg ? getFieldLevel(map, nextOrg.identifier) : 0;
  const maxLevel = prevOrg ? getFieldLevel(map, prevOrg.identifier) + 1 : 0;
  const currentLevel = getFieldLevel(map, activeId);
  const level = clamp(minLevel, currentLevel + deltaLevel, maxLevel);
  let parent = null;
  switch (true) {
    case level === 0 || overIndex === 0:
      parent = null;
      break;
    case level === getFieldLevel(map, prevOrg.identifier):
      parent = prevOrg.parent;
      break;
    case level > getFieldLevel(map, prevOrg.identifier):
      parent = prevOrg.identifier;
      break;
    default:
      parent =
        newOrgs
          .slice(0, overIndex)
          .reverse()
          .find(
            (org) =>
              org.identifier !== activeId &&
              getFieldLevel(map, org.identifier) === level
          )?.parent ?? null;
  }
  return { level, parent };
}

function CardContainer() {
  const sensors = useSensors(useSensor(PointerSensor));
  const [movingState, setMovingState] = useState<{
    overId: string;
    activeId: string;
    level: number;
    parent: string | null;
  } | null>(null);
  const { control, getValues } = useFormContext();
  const { fields, append, remove, insert, move, replace } = useFieldArray({
    control,
    name: "orgs",
  });
  const map = useMemo(
    () => new Map(fields.map((f) => [f.identifier, f])),
    [fields]
  );
  const cards = fields.map((field, index) => {
    let overProps: undefined | { level: number } = undefined;
    if (movingState) {
      const isOver = movingState.overId === field.identifier;
      const over = map.get(movingState.overId)!;
      const active = map.get(movingState.activeId)!;
      const isNotAncestor = !isAncestor(map, active, over);
      const isNotSameObj = active.identifier !== field.identifier;
      const canDrop = isOver && isNotSameObj && isNotAncestor;
      overProps = canDrop ? movingState : undefined;
    }
    const removeSelf = () =>
      replace(
        fields.filter(
          (f) => f.identifier !== field.identifier && !isAncestor(map, field, f)
        )
      );
    return (
      <OrganizationCard
        removeSelf={removeSelf}
        level={getFieldLevel(map, field.identifier)}
        key={field.id}
        name={`orgs.${index}`}
        insert={insert}
        move={move}
        remove={remove}
        index={index}
        id={field.identifier}
        overProps={overProps}
      />
    );
  });

  const onAppend = () =>
    append({ name: "", members: [], identifier: nanoid(), parent: null });
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
      activeData?.type === MEMBER && overData?.type === MEMBER;
    const isSameContainer =
      activeData?.sortable.containerId === overData?.sortable.containerId;
    const bothOrgType =
      activeData?.type === ORGANIZATION && overData?.type === ORGANIZATION;
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
        const activeIndex: number = activeData!.index;
        const overIndex: number = overData!.index;
        const active = fields[activeIndex];
        const over = fields[overIndex];
        if (isAncestor(map, active, over)) {
          break;
        }
        // move active & active's descendant under to over
        const filledFields = getValues(
          fields.map((_, index) => `orgs.${index}` as const)
        );
        const activeSlice = [
          activeIndex,
          activeIndex +
            filledFields
              .slice(activeIndex + 1, fields.length)
              .filter((f) => isAncestor(map, active, f)).length,
        ] as const;
        const section = filledFields.slice(activeSlice[0], activeSlice[1] + 1);
        if (movingState) {
          section[0] = { ...section[0], parent: movingState.parent };
        }
        const sectionSet = new Set(section.map((s) => s.identifier));
        const newFields = filledFields.filter(
          (f) => !sectionSet.has(f.identifier)
        );
        const newOverIndex = newFields.findIndex(
          (f) => f.identifier === over.identifier
        );
        newFields.splice(newOverIndex + 1, 0, ...section);
        replace(newFields);
        break;
    }
    setMovingState((_) => null);
  };
  console.log({ fields });
  const onDragMove = (event: DragMoveEvent) => {
    const {
      delta: { x: deltaX },
      active,
      over,
    } = event;
    const activeData = event.active.data.current;
    const overData = event.over?.data.current;
    const bothOrgType =
      activeData?.type === ORGANIZATION && overData?.type === ORGANIZATION;
    if (!bothOrgType) {
      return;
    }
    const activeId = active!.id;
    const overId = over!.id;
    const { level, parent } = calcOrgDraggingPosition(
      fields,
      activeId,
      overId,
      deltaX
    );
    setMovingState({ level, parent, activeId, overId });
  };
  return (
    <DndContext
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      sensors={sensors}
      onDragEnd={onDragEnd}
      onDragMove={onDragMove}
      collisionDetection={customCollisionDetection}
    >
      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {cards} {appendButton}
        </div>
        <DragOverlay dropAnimation={defaultDropAnimation}>
          <span>
            <DragHandle className="pointer-events-none" />
          </span>
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

import React, { memo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges,
  AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { useFieldArray } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import { ORGANIZATION, ORG_INDENT_WIDTH, useFormContext } from "../models";
import DragHandle from "./DragHandle";
import MemberFieldSet from "./MemberFieldSet";
import UniqueInput from "./UniqueInput";
import { SortableItemProps, FormOrgField } from "../interfaces";

type CardProps = {
  name: `orgs.${number}`;
  level: number;
  id: string;
  overProps?: { level: number };
  removeSelf: () => void;
} & SortableItemProps<FormOrgField>;

interface MembersContainerProps {
  name: `${CardProps["name"]}.members`;
  className?: string;
}

const MembersContainer: React.FC<MembersContainerProps> = memo(
  ({ name, className }) => {
    const { control } = useFormContext();
    const { fields, append, insert, remove, move } = useFieldArray({
      control,
      name: name,
    });
    const onAppend = () =>
      append({
        activated: true,
        name: "",
        age: null,
        representation: false,
      });

    const appendButton = (
      <button
        className="bg-blue-500 w-full h-8 flex justify-center items-center shadow-sm text-white hover:shadow-inner hover:opacity-80"
        type="button"
        onClick={onAppend}
        role="append-member-button"
      >
        <FiPlus />
      </button>
    );
    return (
      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
        {fields.map((field, index) => (
          <MemberFieldSet
            insert={insert}
            remove={remove}
            move={move}
            index={index}
            key={field.id}
            className={className}
            name={`${name}.${index}`}
            field={field}
          />
        ))}
        {appendButton}
      </SortableContext>
    );
  }
);

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges(args) : true;

const OrganizationCard: React.FC<CardProps> = ({
  name,
  remove,
  insert,
  move,
  index,
  level,
  id,
  removeSelf,
  overProps,
}) => {
  const { register } = useFormContext();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      animateLayoutChanges,
      data: {
        type: ORGANIZATION,
        index,
        remove,
        insert,
        move,
      },
    });
  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
    transition: transition,
    marginLeft: level * ORG_INDENT_WIDTH,
  };

  const rowClassName =
    "grid grid-cols-5 gap-2 justify-items-start items-center relative";

  const showIndicator = !!overProps;
  const indicatorLevel = overProps?.level ? overProps.level - level : 0;
  const indicatorTranslateX = indicatorLevel * ORG_INDENT_WIDTH;
  const indicatorStyle = {
    transition: transition,
    position: "absolute" as const,
    transform: `translateX(${indicatorTranslateX}px)`,
    bottom: "-4px",
    left: "0",
    border: "4px solid blue",
    width: "100%",
  };
  return (
    <div
      className="bg-white p-6 rounded min-h-[100px] border-l-4 border-green-400"
      role="organization-card"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex gap-2 items-center">
        <div {...attributes} {...listeners}>
          <DragHandle />
        </div>
        <button
          type="button"
          onClick={removeSelf}
          role="remove-organization-button"
          className="hover:bg-gray-100 hover:text-red-500 px-1 py-2"
        >
          <FiX />
        </button>
        <label className="flex gap-2 items-baseline w-full">
          org:
          <UniqueInput
            type="text"
            className="w-full"
            role="organization-name"
            {...register(`${name}.name`, {
              required: "this field is required",
            })}
          />
        </label>
      </div>
      <input type="hidden" {...register(`${name}.identifier`)} />
      <input type="hidden" {...register(`${name}.parent`)} />
      <div className="flex flex-col gap-2">
        <div className={rowClassName}>
          <span className="justify-self-end">users</span>
          <span>name:</span>
          <span>age:</span>
          <span>activated:</span>
          <span>representation:</span>
        </div>
        <MembersContainer name={`${name}.members`} className={rowClassName} />
      </div>
      {showIndicator && <div style={indicatorStyle} />}
    </div>
  );
};

export default memo(OrganizationCard);

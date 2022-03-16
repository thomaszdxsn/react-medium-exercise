import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useFieldArray } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import { useFormContext } from "../models";
import DragHandle from "./DragHandle";
import MemberFieldSet from "./MemberFieldSet";
import UniqueInput from "./UniqueInput";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps, FormOrgField } from "../interfaces";

type CardProps = {
  name: `orgs.${number}`;
} & SortableItemProps<FormOrgField>;

interface MembersContainerProps {
  name: `${CardProps["name"]}.members`;
  className?: string;
}

const MembersContainer: React.FC<MembersContainerProps> = React.memo(
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

const OrganizationCard: React.FC<CardProps> = ({
  name,
  remove,
  insert,
  move,
  index,
}) => {
  const { register } = useFormContext();
  const { attributes, listeners, setNodeRef, transform, transition, isOver } =
    useSortable({
      id: name,
      data: {
        type: "organization" as const,
        index,
        remove,
        insert,
        move,
      },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };
  const rowClassName =
    "grid grid-cols-5 gap-2 justify-items-start items-center";
  const removeSelf = () => remove(index);
  if (isOver) {
    console.log({ isOver, name });
  }
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
      <input type="hidden" {...register(`${name}.id`)} />
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
    </div>
  );
};

export default React.memo(OrganizationCard);

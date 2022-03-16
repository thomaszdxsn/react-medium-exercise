import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFieldArray } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import { useFormContext } from "../models";
import DragHandle from "./DragHandle";
import MemberFieldSet from "./MemberFieldSet";
import UniqueInput from "./UniqueInput";

interface CardProps {
  name: `orgs.${number}`;
  removeSelf: () => void;
}

interface MembersContainerProps {
  name: `${CardProps["name"]}.members`;
  className?: string;
}

const MembersContainer: React.FC<MembersContainerProps> = ({
  name,
  className,
}) => {
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
};

const OrganizationCard: React.FC<CardProps> = ({ name, removeSelf }) => {
  const { register } = useFormContext();
  const rowClassName =
    "grid grid-cols-5 gap-2 justify-items-start items-center";
  return (
    <div
      className="bg-white p-6 rounded min-h-[100px]"
      role="organization-card"
    >
      <div className="flex gap-2">
        <DragHandle />
        <button
          type="button"
          onClick={removeSelf}
          role="remove-organization-button"
          className="hover:bg-gray-100 hover:text-red-500 px-1"
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

export default OrganizationCard;

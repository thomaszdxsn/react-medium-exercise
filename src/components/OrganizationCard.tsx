import React from "react";
import { useFieldArray } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import { useFormContext } from "../models";
import DragHandle from "./DragHandle";
import MemberFieldSet from "./MemberFieldSet";

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
  const { fields, remove, append } = useFieldArray({ control, name: name });

  const onAppend = () => append({ activated: true });

  const appendButton = (
    <button
      className="bg-white border border-gray-100 shadow w-full h-8 flex justify-center items-center"
      type="button"
      onClick={onAppend}
    >
      <FiPlus />
    </button>
  );

  return (
    <>
      {fields.map((field, index) => (
        <MemberFieldSet
          removeSelf={() => remove(index)}
          key={field.id}
          className={className}
          name={`${name}.${index}`}
        />
      ))}
      {appendButton}
    </>
  );
};

const OrganizationCard: React.FC<CardProps> = ({ name, removeSelf }) => {
  const { register } = useFormContext();
  const rowClassName =
    "grid grid-cols-5 gap-2 justify-items-start items-center";
  return (
    <div className="bg-white p-4 rounded min-h-[200px]">
      <div className="flex gap-2">
        <DragHandle />
        <button
          type="button"
          onClick={removeSelf}
          className="hover:bg-gray-100 px-1"
        >
          <FiX />
        </button>
        <label className="flex gap-2 items-baseline w-full">
          org:
          <input
            type="text"
            className="w-full"
            {...register(`${name}.name`, { required: true })}
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

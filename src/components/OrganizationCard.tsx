import React from "react";
import { useFieldArray } from "react-hook-form";
import { useFormContext } from "../models";
import DragHandle from "./DragHandle";
import MemberFieldSet from "./MemberFieldSet";

interface CardProps {
  name: `orgs.${number}`;
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
  const { fields } = useFieldArray({ control, name: name });

  return (
    <>
      {fields.map((field, index) => (
        <MemberFieldSet
          key={field.id}
          className={className}
          name={`${name}.${index}`}
        />
      ))}
    </>
  );
};

const OrganizationCard: React.FC<CardProps> = ({ name }) => {
  const { register } = useFormContext();
  const rowClassName =
    "grid grid-cols-5 gap-2 justify-items-start items-center";
  return (
    <div className="bg-white p-4 rounded min-h-[200px]">
      <div className="flex gap-2">
        <DragHandle />
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

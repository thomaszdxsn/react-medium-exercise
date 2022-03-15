import React, { FC, useMemo, useRef, useEffect } from "react";
import { useWatch } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useFormContext } from "../models";
import type { FormValues } from "../interfaces";
import UniqueInput from "./UniqueInput";
import DragHandle from "./DragHandle";

interface FieldSetProps {
  className?: string;
  name: `orgs.${number}.members.${number}`;
  removeSelf: () => void;
}

interface PresentationCheckboxProps {
  name: `${FieldSetProps["name"]}`;
}

function getMembersNamePath(name: FieldSetProps["name"]) {
  const path = name.split(".");
  return path.slice(0, path.length - 1).join(".") as `orgs.${number}.members`;
}

function getMembersFromFormValues(
  formValues: FormValues,
  pathStr: ReturnType<typeof getMembersNamePath>
) {
  const [orgField, orgIndexField, membersField] = pathStr.split(".") as [
    `orgs`,
    `${number}`,
    `members`
  ];
  const indexField = Number(orgIndexField);
  return formValues[orgField][indexField][membersField];
}

const RepresentationCheckbox: FC<PresentationCheckboxProps> = ({ name }) => {
  const { register, control, setValue, getValues } = useFormContext();
  const activated = useWatch({ control, name: `${name}.activated` });
  const disabled = useMemo(() => !activated, [activated]);
  const representation = useWatch({ control, name: `${name}.representation` });
  const oldRepresentation = useRef(representation);
  const fieldName = `${name}.representation` as const;
  useEffect(() => {
    if (representation !== oldRepresentation.current) {
      oldRepresentation.current = representation;

      // reselect other members representation when current
      if (representation === true) {
        const membersNamePath = getMembersNamePath(name);
        const membersValue = getMembersFromFormValues(
          getValues(),
          membersNamePath
        );
        membersValue.forEach((member, index) => {
          const representationPath =
            `${membersNamePath}.${index}.representation` as const;
          if (
            representationPath !== fieldName &&
            member.representation === true
          ) {
            setValue(representationPath, false);
          }
        });
      }
    }
  }, [representation, fieldName]);
  useEffect(() => {
    // reselect representation when disabled
    if (disabled) {
      setValue(fieldName, false);
    }
  }, [disabled, fieldName]);
  return (
    <input
      type="checkbox"
      className="disabled:opacity-30 disabled:bg-gray-100 disabled:cursor-not-allowed"
      role="member-representation"
      {...register(fieldName, { disabled })}
    />
  );
};

const MemberFieldSet: FC<FieldSetProps> = ({ className, name, removeSelf }) => {
  const { register } = useFormContext();
  return (
    <div className={className} role="member-field-set">
      <div className="justify-self-end flex gap-1">
        <DragHandle />
        <button
          className="hover:bg-gray-100 hover:text-red-500 px-1"
          type="button"
          onClick={removeSelf}
          role="remove-member-button"
        >
          <FiX />
        </button>
      </div>
      <UniqueInput
        type="text"
        autoComplete="off"
        role="member-name"
        {...register(`${name}.name`, { required: "this field is required" })}
      />
      <input
        type="number"
        role="member-age"
        {...register(`${name}.age`, {
          valueAsNumber: true,
          min: { value: 1, message: "age must be great than 0" },
          max: { value: 1000, message: "age must be less than 1000" },
        })}
      />
      <input
        role="member-activated"
        type="checkbox"
        {...register(`${name}.activated`)}
      />
      <RepresentationCheckbox name={name} />
    </div>
  );
};

export default MemberFieldSet;

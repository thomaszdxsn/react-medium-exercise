import React from "react";
import { useWatch } from "react-hook-form";
import { useFormContext } from "../models";
import type { FormValues } from "../interfaces";
import DragHandle from "./DragHandle";
import { FiX } from "react-icons/fi";

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

const RepresentationCheckbox: React.FC<PresentationCheckboxProps> = ({
  name,
}) => {
  const { register, control, setValue, getValues } = useFormContext();
  const activated = useWatch({ control, name: `${name}.activated` });
  const disabled = React.useMemo(() => !activated, [activated]);
  const representation = useWatch({ control, name: `${name}.representation` });
  const oldRepresentation = React.useRef(representation);
  const fieldName = `${name}.representation` as const;
  React.useEffect(() => {
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
  React.useEffect(() => {
    // reselect representation when disabled
    if (disabled) {
      setValue(fieldName, false);
    }
  }, [disabled, fieldName]);
  return (
    <input
      type="checkbox"
      className="disabled:opacity-30 disabled:bg-gray-100 disabled:cursor-not-allowed"
      {...register(fieldName, { disabled })}
    />
  );
};

const MemberFieldSet: React.FC<FieldSetProps> = ({
  className,
  name,
  removeSelf,
}) => {
  const { register } = useFormContext();
  return (
    <div className={className}>
      <div className="justify-self-end flex gap-1">
        <DragHandle />
        <button
          className="hover:bg-gray-100 px-1"
          type="button"
          onClick={removeSelf}
        >
          <FiX />
        </button>
      </div>
      <input
        type="text"
        autoComplete="off"
        {...register(`${name}.name`, { required: "this field is required" })}
      />
      <input
        type="number"
        {...register(`${name}.age`, { valueAsNumber: true })}
      />
      <input type="checkbox" {...register(`${name}.activated`)} />
      <RepresentationCheckbox name={name} />
    </div>
  );
};

export default MemberFieldSet;

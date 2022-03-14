import React from "react";
import { useWatch } from "react-hook-form";
import { useFormContext } from "../models";
import type { FormValues } from "../interfaces";
import DragHandle from "./DragHandle";

interface FieldSetProps {
  className?: string;
  name: `orgs.${number}.members.${number}`;
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
      console.log({ new: representation, name });
      oldRepresentation.current = representation;

			// reselect other members representation when current
      if (representation === true) {
        const membersNamePath = getMembersNamePath(name);
        const membersValue = getMembersFromFormValues(
          getValues(),
          membersNamePath
        );
        console.log({ membersValue, membersNamePath, values: getValues() });
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
        console.log({ values: getValues() });
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
      className="disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
      {...register(fieldName)}
    />
  );
};

const MemberFieldSet: React.FC<FieldSetProps> = ({ className, name }) => {
  const { register } = useFormContext();
  return (
    <div className={className}>
      <DragHandle className="justify-self-end" />
      <input type="text" {...register(`${name}.name`, { required: true })} />
      <input type="number" {...register(`${name}.age`)} />
      <input type="checkbox" {...register(`${name}.activated`)} />
      <RepresentationCheckbox name={name} />
    </div>
  );
};

export default MemberFieldSet;

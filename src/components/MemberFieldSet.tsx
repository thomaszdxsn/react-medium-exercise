import React from "react";
import { useWatch } from "react-hook-form";
import { useFormContext } from "../models";
import DragHandle from "./DragHandle";

interface FieldSetProps {
  className?: string;
  name: `orgs.${number}.members.${number}`;
}

interface PresentationCheckboxProps {
  name: `${FieldSetProps["name"]}`;
}

const RepresentationCheckbox: React.FC<PresentationCheckboxProps> = ({
  name,
}) => {
  const { register, control } = useFormContext();
  const activated = useWatch({ control, name: `${name}.activated` });
  const disabled = React.useMemo(() => !activated, [activated]);
  return (
    <input
      type="checkbox"
      className="disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
      {...register(`${name}.representation`)}
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

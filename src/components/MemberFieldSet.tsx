import React from "react";
import { useFormContext } from "../models";
import DragHandle from "./DragHandle";

interface Props {
  className?: string;
  name: `orgs.${number}.members.${number}`;
}

const MemberFieldSet: React.FC<Props> = ({ className, name }) => {
  const { register } = useFormContext();
  return (
    <div className={className}>
      <DragHandle className="justify-self-end" />
      <input type="text" {...register(`${name}.name`, { required: true })} />
      <input type="number" {...register(`${name}.age`)} />
      <input type="checkbox" {...register(`${name}.activated`)} />
      <input type="checkbox" {...register(`${name}.representation`)} />
    </div>
  );
};

export default MemberFieldSet;

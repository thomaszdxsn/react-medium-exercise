import React from "react";
import { useWatch } from "react-hook-form";
import { FiX } from "react-icons/fi";
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormContext } from "../models";
import type {
  FormMemberField,
  FormValues,
  SortableItemProps,
} from "../interfaces";
import UniqueInput from "./UniqueInput";
import DragHandle from "./DragHandle";

type FieldSetProps = {
  className?: string;
  name: `orgs.${number}.members.${number}`;
  field: FormMemberField;
} & SortableItemProps<FormMemberField>;

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

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges(args) : true;

const MemberFieldSet: React.FC<FieldSetProps> = ({
  className,
  name,
  remove,
  insert,
  move,
  index,
  field,
}) => {
  const { register } = useFormContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: name,
    animateLayoutChanges,
    data: {
      remove,
      insert,
      move,
      index,
      type: "member" as const,
      field: field,
    },
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    borderTop: isOver ? "2px solid blue" : undefined,
  };
  const removeSelf = () => remove(index);
  return (
    <div className={className} style={style} ref={setNodeRef}>
      <div className="justify-self-end flex gap-1">
        <div {...listeners} {...attributes}>
          <DragHandle />
        </div>
        <button
          className="hover:bg-gray-100 hover:text-red-500 px-1"
          type="button"
          onClick={removeSelf}
        >
          <FiX />
        </button>
      </div>
      <UniqueInput
        type="text"
        autoComplete="off"
        {...register(`${name}.name`, { required: "this field is required" })}
      />
      <input
        type="number"
        {...register(`${name}.age`, {
          valueAsNumber: true,
          min: { value: 1, message: "age must be great than 0" },
          max: { value: 1000, message: "age must be less than 1000" },
        })}
      />
      <input type="checkbox" {...register(`${name}.activated`)} />
      <RepresentationCheckbox name={name} />
    </div>
  );
};

export default MemberFieldSet;

export const PlusIcon: React.FC = () => (
  <svg width={20} height={15}>
    <line x={2} y={2} width={10} />
    <line x={2} y={8} width={10} />
  </svg>
);
export const MinusIcon: React.FC = () => <svg>test</svg>;
export function DragHandleIcon() {
  return (
    <svg width="18" height="22">
      <defs>
        <circle cx="1" cy="1" r="1" id="dot" />
      </defs>

      <use xlinkHref="#dot" x="5" y="5" />
      <use xlinkHref="#dot" x="10" y="5" />
      <use xlinkHref="#dot" x="5" y="10" />
      <use xlinkHref="#dot" x="10" y="10" />
      <use xlinkHref="#dot" x="5" y="15" />
      <use xlinkHref="#dot" x="10" y="15" />
    </svg>
  );
}

function DragHandle(props: { className?: string }) {
  const className = [
    "grid place-content-center p-1 rounded hover:bg-gray-100",
    props.className ?? "",
  ].join(" ");
  return (
    <button className={className} type="button">
      <DragHandleIcon />
    </button>
  );
}

export default DragHandle;

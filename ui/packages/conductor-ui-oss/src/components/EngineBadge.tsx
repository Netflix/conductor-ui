import Pill from "./Pill";

export default function EngineBadge({
  engine,
}: {
  engine: string | undefined;
}) {
  return (
    <>
      {engine && (
        <Pill
          variant="outlined"
          color={engine === "4.0" ? "blue" : undefined}
          label={engine}
          tooltip={`Executed on Workflow Engine ${engine}`}
        />
      )}
    </>
  );
}

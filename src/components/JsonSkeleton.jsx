import { Skeleton } from "@mui/material";

export default function JsonSkeleton({ lines = 10 }) {
  return (
    <div style={{ margin: 15 }}>
      <Skeleton width={50} />
      {Array(10)
        .fill()
        .map((val, idx) => {
          return (
            <Skeleton key={idx} style={{ marginLeft: 30, marginRight: 30 }} />
          );
        })}
      <Skeleton width={50} />
    </div>
  );
}
